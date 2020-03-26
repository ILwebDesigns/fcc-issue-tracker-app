/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *       (if additional are added, keep them at the very end!)
 */

var chaiHttp = require("chai-http");
var chai = require("chai");
var assert = chai.assert;
var server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function() {
  suite("POST /api/issues/{project} => object with issue data", function() {
    test("Every field filled in", function(done) {
      chai
        .request(server)
        .post("/api/issues/test")
        .send({
          issue_title: "Title",
          issue_text: "text",
          created_by: "Functional Test - Every field filled in",
          assigned_to: "Chai and Mocha",
          status_text: "In QA"
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          Object.keys(res.body).forEach(key => {
            assert.isOk(res.body[key] !== "");
          });
          done();
        });
    });

    test("Required fields filled in", function(done) {
      chai
        .request(server)
        .post("/api/issues/test")
        .send({
          issue_title: "Title",
          issue_text: "text",
          created_by: "Functional Test - Every field filled in"
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          let test = res.body;
          assert.isOk(test.issue_title !== "");
          assert.isOk(test.issue_text !== "");
          assert.isOk(test.created_by !== "");
          done();
        });
    });

    test("Missing required fields", function(done) {
      chai
        .request(server)
        .post("/api/issues/test")
        .send({
          issue_title: "",
          issue_text: "",
          created_by: ""
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          let test = res.body;
          assert.isOk(test.issue_title == "");
          assert.isOk(test.issue_text == "");
          assert.isOk(test.created_by == "");
          done();
        });
    });
  });

  suite("PUT /api/issues/{project} => text", function() {
    test("No body", function(done) {
      chai
        .request(server)
        .put("/api/issues/test")
        .send({ _id: "5e7c168f89d96301269367bc" })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body, "no updated field sent");
          done();
        });
    });

    test("One field to update", function(done) {
      chai
        .request(server)
        .put("/api/issues/test")
        .send({
          _id: "5e7c16e5b1df07022bbc39df",
          issue_title: "TitleIssue"
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body, "successfully updated");
          done();
        });
    });

    test("Multiple fields to update", function(done) {
      chai
        .request(server)
        .put("/api/issues/test")
        .send({
          _id: "5e7c16e5b1df07022bbc39df",
          issue_title: "TitleIssue",
          issue_text: "ASDASDASD"
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body, "successfully updated");
          done();
        });
    });
  });

  suite(
    "GET /api/issues/{project} => Array of objects with issue data",
    function() {
      test("No filter", function(done) {
        chai
          .request(server)
          .get("/api/issues/test")
          .query({})
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.property(res.body[0], "issue_title");
            assert.property(res.body[0], "issue_text");
            assert.property(res.body[0], "created_on");
            assert.property(res.body[0], "updated_on");
            assert.property(res.body[0], "created_by");
            assert.property(res.body[0], "assigned_to");
            assert.property(res.body[0], "open");
            assert.property(res.body[0], "status_text");
            assert.property(res.body[0], "_id");
            done();
          });
      });

      test("One filter", function(done) {
        chai
          .request(server)
          .get("/api/issues/test")
          .query({ open: false })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.property(res.body[0], "_id");
            assert.property(res.body[1], "_id");
            assert.isOk(res.body[2] == undefined);
            done();
          });
      });

      test("Multiple filters (test for multiple fields you know will be in the db for a return)", function(done) {
        chai
          .request(server)
          .get("/api/issues/test")
          .query({
            issue_text: "ASDASDASD",
            open: false
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.equal(res.body[0].open, false);
            assert.equal(res.body[1].open, false);
            assert.equal(res.body[0].issue_text, "ASDASDASD");
            assert.equal(res.body[1].issue_text, "ASDASDASD");
            done();
          });
      });
    }
  );

  suite("DELETE /api/issues/{project} => text", function() {
    test("No _id", function(done) {
      chai
        .request(server)
        .delete("/api/issues/test")
        .send({})
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body, "_id error");
          done();
        });
    });

    test("Valid _id", function(done) {
      chai
        .request(server)
        .delete("/api/issues/test")
        .send({ _id: "5e7c168f89d96301269367b2" }) // id doesn't exist
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.notEqual(res.body, "_id error");
          done();
        });
    });
  });
});
