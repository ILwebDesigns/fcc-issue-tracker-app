/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

let expect = require("chai").expect;
let MongoClient = require("mongodb").MongoClient;
let ObjectId = require("mongodb").ObjectID;
let assert = require("assert");

const CONNECTION_STRING = process.env.DB;

const client = new MongoClient(CONNECTION_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

(async function() {
  try {
    await client.connect();
    console.log("Connected correctly to server db");
  } catch (err) {
    console.log("Error al conectar a la db: " + err);
  }
})();

module.exports = function(app) {
  app
    .route("/api/issues/:project")
    .get(function(req, res) {
      let project = req.params.project;
      let query = req.query;
      query.open == "false" ? (query.open = false) : null;
      query.open == "true" ? (query.open = true) : null;
      (async function() {
        try {
          let db = client.db(project);
          let docs = await db
            .collection("issues")
            .find(query)
            .toArray();
          res.json(docs);
        } catch (err) {
          console.log(err);
        }
      })();
    })

    .post(function(req, res) {
      let project = req.params.project;
      let body = req.body;
      (async function() {
        try {
          let db = client.db(project);
          let issue = await db
            .collection("issues")
            .findOne({ issue_title: body.issue_title });
          //assert.equal(null, issue, "Document duplicated");
          let ins = await db.collection("issues").insertOne({
            issue_title: body.issue_title,
            issue_text: body.issue_text,
            created_by: body.created_by,
            assigned_to: body.assigned_to,
            status_text: body.status_text,
            created_on: new Date(),
            updated_on: new Date(),
            open: true
          });
          assert.equal(
            1,
            ins.insertedCount,
            "No pudo agregarse nuevo documento"
          );
          res.json(ins.ops[0]);
        } catch (err) {
          console.log(err);
        }
      })();
    })

    .put(function(req, res) {
      let project = req.params.project;
      let id = req.body._id;
      let data = { ...req.body };
      Object.keys(data).forEach(key => {
        data[key] == "" && delete data[key];
        delete data._id;
      });
      req.body.open == "false" || req.body.option == false
        ? (data.open = false)
        : null;

      Object.keys(data).length > 0
        ? (async function() {
            try {
              let db = client.db(project);
              let update = await db
                .collection("issues")
                .findOneAndUpdate(
                  { _id: new ObjectId(id) },
                  { $set: { ...data, updated_on: new Date() } }
                );
              update.lastErrorObject.n
                ? res.json("successfully updated")
                : res.json(`could not update ${req.body._id}`);
            } catch (err) {
              console.log(err);
            }
          })()
        : res.json("no updated field sent");
    })

    .delete(function(req, res) {
      let remove = req.body._id;
      let project = req.params.project;
      remove
        ? (async function() {
            try {
              let db = client.db(project);
              let del = await db
                .collection("issues")
                .findOneAndDelete({ _id: new ObjectId(remove) });

              del.value
                ? res.json("deleted " + remove)
                : res.json("could not delete " + remove);
            } catch (err) {
              console.log(err);
            }
          })()
        : res.json("_id error");
    });
  client.close();
};
