import {Controller, Get, Query, Delete, HttpStatus, HttpCode, Param} from "@nestjs/common";
import {Activity, Resource, ActivityQuery, Action} from "./";
import {ActivityService} from "./activity.service";
import {JSONP, DATE, NUMBER} from "@spica-server/core";
import {ObjectId, OBJECT_ID, FilterQuery} from "@spica-server/database";

@Controller("activity")
export class ActivityController {
  constructor(private activityService: ActivityService) {}
  @Get()
  find(
    @Query("identifier") identifier,
    @Query("action", NUMBER) action: number = -1,
    @Query("resource", JSONP) resource: Resource,
    @Query("begin", DATE) begin: Date,
    @Query("end", DATE) end: Date,
    @Query("skip", NUMBER) skip: number,
    @Query("limit", NUMBER) limit: number
  ): Promise<Activity[]> {
    let aggregation: object[] = [
      {
        $lookup: {
          from: "identity",
          localField: "identifier",
          foreignField: "_id",
          as: "identifier"
        }
      },
      {$unwind: "$identifier"},
      {
        $set: {
          identifier: "$identifier.identifier"
        }
      }
    ];

    let filter: FilterQuery<ActivityQuery> = {};

    if (identifier) filter.identifier = identifier;

    if (!isNaN(begin.getTime()) && !isNaN(end.getTime())) {
      filter._id = {
        $gte: ObjectId.createFromTime(begin.getTime() / 1000),
        $lt: ObjectId.createFromTime(end.getTime() / 1000)
      };
    }

    if (Action[action]) filter.action = action;

    if (resource) {
      if (resource.name) {
        filter["resource.name"] = resource.name;
      }
      if (resource.documentId) {
        filter["resource.documentId"] = {
          $in: Array.isArray(resource.documentId) ? resource.documentId : [resource.documentId]
        };
      }
    }

    if (filter) aggregation.push({$match: filter});

    if (skip) aggregation.push({$skip: skip});

    if (limit) aggregation.push({$limit: limit});

    return this.activityService.aggregate(aggregation).toArray();
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param("id", OBJECT_ID) id: ObjectId) {
    return this.activityService.deleteOne({_id: id});
  }
}