//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://FasihNoor:Fasih123@cluster0.rfjjv.mongodb.net/todolistDB", {useNewUrlParser: true});

const itemSchema ={  //Mongoose schema 
  name: String 
}

const Item = mongoose.model("Item", itemSchema ); //Mongoose Model

const item1 = new Item ({
  name: "WELCOME TO YOUR PERSONAL TODOLIST"
});

const item2 = new Item ({
  name: "Hit the + button to add a new Item!"
});

const item3 = new Item ({
  name: "<-- Hit this to delete an Item!"
});

const defaultItems = [item1,item2,item3];




const listSchema = { //Creating the other list and making it have the same schema as the item. 
  name: String,
  items: [itemSchema]
}

const List =mongoose.model("List", listSchema);


app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);//Capitalizing the first letter of the given user input. 

    List.findOne({name: customListName}, function(err, foundList){ //Seeing if the list already exists. 
      if(!err){
        if(!foundList){ //If the specific list is not found... 
          const list = new List({
            name: customListName,
            items: defaultItems
          })
      
          list.save();
          res.redirect("/" + customListName); //Redirecting to the this same route 
          
        }
        else{ //If that list exists... 
          res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
        }
      }
    })

 



  
});








app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems){

      if(foundItems.length === 0){
          Item.insertMany(defaultItems, function(err){
            if(err){
              console.log(err);
            }
            else{
              console.log("Success")
            }
        });
        res.redirect("/") //Redirecting to the home page so it will go through the get request again and this time, won't go inside the if loop. 
      }
      
      else{
        res.render("list", {listTitle: "Today", newListItems: foundItems});
      }

      
 
  })

  
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const newItem = new Item ({
    name: itemName,
  })

  if(listName === "Today"){

    newItem.save();
    res.redirect("/");
  }
  else {

    List.findOne({name:listName}, function(err, foundList){
      foundList.items.push(newItem); //Finding the alreayd made list and adding the new item to THAT list. 
      foundList.save();
      res.redirect("/" + listName); 
    })

  }

 

  
});

app.post("/delete", function(req,res){
  
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){

    Item.findByIdAndRemove(checkedItemId, function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("Success")
      }
    });
  
    res.redirect("/");

  }
  else{
    List.findOneAndUpdate(
      {name: listName },
      {$pull: {items: {_id: checkedItemId}}},
      function(err, foundList){

        if (!err){
          res.redirect("/" + listName); 
        }
      }
      
    )
  }
   

  

})





app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT||3000, function() {
  console.log("Server started on port 3000 or on Heroku");
});
