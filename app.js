//jshint esversion:6
const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

main().catch((err) => console.log(err));
async function main() {
  mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");
}
const itemsSchema = new mongoose.Schema({
  name: String,
});

const listSchema=new mongoose.Schema({
  name:String,
  items:[itemsSchema]
})
const Item = mongoose.model("Item", itemsSchema);
const List=mongoose.model("List",listSchema)
const item1 = new Item({ name: "Welcome to do list" });
const item2 = new Item({ name: "Hit + button to add a task" });
const item3 = new Item({
  name: "Hit the chekbox to delete the completed tast",
});
const defaultitems = [item1, item2, item3];
async function getitems() {
  const Items = await Item.find({});
  return Items;
}
app.get("/", function (req, res) {
  getitems().then(function (founditems) {
    if (founditems.length === 0) {
      Item.insertMany(defaultitems).then(function (docs) {
        if (docs) console.log(docs);
        else console.log("Failed in insertion of items");
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: founditems });
    }
  });
});

app.post("/", function (req, res) {
  const Itemname = req.body.newItem;
  const listname = req.body.list;
  const item4= new Item({
    name:Itemname
  })
  item4.save();
  res.redirect("/");
});

app.post("/delete",function(req,res){
  const checkedItemID=req.body.checkbox
  Item.deleteOne({_id:checkedItemID}).then(function(docs,err){
          if(docs) console.log(docs)
          else console.log(err)
  })
  res.redirect("/")
})

app.get("/:routeitem", function (req, res) {
  const requestedItem=req.params.routeitem;
  List.findOne({name:requestedItem}).then(function(foundlist){
    if(!foundlist){
      const list=new List({
        name:requestedItem,
        items:[defaultitems]
      })
     console.log(defaultitems)
     res.redirect("/"+requestedItem)
      list.save();
    }else{
      res.render("list",{ listTitle: foundlist.name, newListItems: foundlist.items })
    }
    
  })
  
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
