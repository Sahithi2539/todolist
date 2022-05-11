//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-sahithi:TestSahi@cluster0.ogpi3.mongodb.net/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}, err => {
  if (err) throw err;
  console.log('Connected to MongoDB!!!')
});

const itemsSchema={
  name : String
}

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
  name : "Welcome to your Todolist!"
});

const item2 = new Item({
  name: "Hit the  + button to add a new item."
});

const item3 = new Item({
  name: "<-- Hit this to detele an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List",listSchema);
// Item.insertMany(defaultItems,function(err){
//   if(err){
//     console.log(err);
//   }else{
//     console.log("successfully saved Default items to DB");
//   }
// })

app.get("/", function(req, res) {

  Item.find({},function(err,foundItems){
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("successfully saved Default items to DB");
        }
      });
      res.redirect("/");
    }else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });

//  res.render("list", {listTitle: Today, newListItems: items});

});

app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName},function(err, foundList){
    if(!err){
      if(!foundList){
        //Create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });

        list.save();
        res.redirect("/"+customListName);
      } else{
        //Show the existing list
        res.render("list",{listTitle: foundList.name,newListItems: foundList.items})
      }
    }
  })


});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName == "Today"){
    item.save();
    res.redirect("/");
  } else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }
  // const item = new Item({
  //   name: itemName
  // });
  //
  // item.save();
  // res.redirect("/");
  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName == "Today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(!err){
        console.log("successfully deleted item.");
        res.redirect("/")
      }
    });
  } else {
      List.findOneAndUpdate({name: listName},{$pull: {items:{_id:checkedItemId}}},function(err, foundList){
        if(!err){
          res.redirect("/"+listName);
        }
      });
  }
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});
