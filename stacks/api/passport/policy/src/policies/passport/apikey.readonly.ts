export default {
  _id: "ApiKeyReadOnlyAccess",
  name: "ApiKey Read Only Access",
  description: "Read only access to passport apikey service.",
  statement: [
    {
      action: "passport:apikey:index",
      resource: {
        include: "*"
      },
      module: "passport:apikey"
    },
    {
      action: "passport:apikey:show",
      resource: {
        include: "*"
      },
      module: "passport:apikey"
    }
  ]
};
