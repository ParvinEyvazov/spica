#!/usr/bin/env bash
set -u -e -o pipefail

echo "Building the database, bucket and identity package"
yarn bazel build //stacks/api/function/packages/database:package //stacks/api/function/packages/bucket:package //stacks/api/function/packages/identity:package

(cd "./bazel-bin/stacks/api/function/packages/database/package")
(cd "./bazel-bin/stacks/api/function/packages/bucket/package")
(cd "./bazel-bin/stacks/api/function/packages/identity/package")



echo "Now please provide the root directory of functions which you want install these packages locally.";
echo "If you leave empty /private/tmp/functions will be used as default"
read -p "Path: " FUNCTION_PATH
FUNCTION_PATH=${FUNCTION_PATH:=/private/tmp/functions}


for DIR in $FUNCTION_PATH/*
do
  DATABASE_PATH="$DIR/node_modules/@spica-devkit/database"
  BUCKET_PATH="$DIR/node_modules/@spica-devkit/bucket"
  IDENTITY_PATH="$DIR/node_modules/@spica-devkit/identity"

  (mkdir -p $DATABASE_PATH && rsync -ar --no-owner --no-group ./bazel-bin/stacks/api/function/packages/database/package/* $DATABASE_PATH)
  (cd $DATABASE_PATH && npm install)
  (mkdir -p $BUCKET_PATH && rsync -ar --no-owner --no-group ./bazel-bin/stacks/api/function/packages/bucket/package/* $BUCKET_PATH)
  (cd $BUCKET_PATH && npm install)
  (mkdir -p $IDENTITY_PATH && rsync -ar --no-owner --no-group ./bazel-bin/stacks/api/function/packages/identity/package/* $IDENTITY_PATH)
  (cd $IDENTITY_PATH && npm install)
done
