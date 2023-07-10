const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _=require("lodash")
const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
// let items = [];
// let workItems=[];
//Connecting to database

mongoose.connect("mongodb+srv://admin_0:todolistdb@cluster0.vz0ej8u.mongodb.net/toDoListDB")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("mongo error"));

const itemsSchema = {
  name: {
    type: String,
    required: [true, "Name not specified"]

  }
};

const Item = mongoose.model("Item", itemsSchema)
const item1 = new Item({
  name: "Welcome To The TO DO LIST"
})
const item2 = new Item({
  name: "Click the checkbox to Delete"
})
const item3 = new Item({
  name: "Click the + Button to Add"
})

const defaultItem = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};
const List = mongoose.model("List", listSchema)



// backend basic data to make site live


//   For Title Date
let today = new Date();
let options = {
  day: "numeric", weekday: "long", month: "long"
};
let day = today.toLocaleDateString("en-US", options);

//root directory

app.get("/", function (req, res) {

  //For Reading from DB

  Item.find({}).then(function (foundItem) {
    if (foundItem.length === 0) {
      Item.insertMany(defaultItem).then(function () {
        console.log("Items Inserted");
      }).catch(function (err) {
        console.log(err);
      });
      res.redirect('/');

    } else {
      res.render("list", { listTitle: day, newListItems: (foundItem) });
    }
  }).catch(function (err) {
    // console.log(err);
  });

});

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({ name: customListName }).then(function (foundList, err) {
    if (!err) {
      if (!foundList) {
        //Create new List 
        const list = new List({
          name: customListName,
          items: defaultItem

        });
        list.save();
        res.redirect('/' + customListName)
      } else {
        //Show Existing List
        res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
      }
    }
  })

});

//for taking data from site
app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });

  if (listName === day) {
    item.save();

    res.redirect('/');
  } else {
    List.findOne({ name: listName }).then(function (foundList, err) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }

});

app.post('/delete', function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName===day){
    Item.findByIdAndRemove(checkedItemId)
    .then(() => {
        console.log("Successfully deleted checked item")
        res.redirect("/");
    });
} else{
    List.findByIdAndUpdate({name: listName.name}, {$pull: {item: {_id: checkedItemId}}})
        .catch((err) => {
            if(!err){
              
                res.redirect("/" + listName);
            }else{
              console.log(err);
            }
        });
}





});



// for Adding to server
app.listen(3000, function () {
  console.log("Server started on port 3000.");
});




//   Video 242;
// let today = new Date();
// let curDay = today.getDay();
// let day = "";

// switch (curDay) {
//   case 0:
//     day = "Sunday";
//     break;
//   case 1:
//     day = "Monday";
//     break;
//   case 2:
//     day = "Tuesday";
//     break;
//   case 3:
//     day = "Wednesday";
//     break;
//   case 4:
//     day = "Thursday";
//     break;
//   case 5:
//     day = "Friday";
//     break;
//   case 6:
//     day = "Saturday";
//     break;
//   default:
//     console.log("Error: current day = "+curDay);
// }