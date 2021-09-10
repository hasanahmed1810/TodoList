const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const _ = require('lodash')


const app = express()

app.set("view engine", "ejs")

app.use(bodyParser.urlencoded({
    extended: true
}))

app.use(express.static("public"))

mongoose.connect("mongodb+srv://admin-hasan:1234@cluster0.on6ky.mongodb.net/todolistDB?retryWrites=true&w=majority/", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

const itemSchema = new mongoose.Schema({
    name: String
})

const Item = mongoose.model('Items', itemSchema)

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemSchema]
})

const List = mongoose.model('Lists', listSchema)

app.get('/', function (req, res) {
    Item.find({}, function (err, foundItems) {
        res.render("list", {
            listTitle: "General",
            items: foundItems,
        })
    })
})

app.get('/:customListName', function (req, res) {
    const customListName = _.capitalize(req.params.customListName)

    List.findOne({
        name: customListName
    }, function (err, foundList) {
        if (!err) {
            if (!foundList) {
                const list = new List({
                    name: customListName,
                    items: []
                })

                list.save()
                res.redirect("/" + customListName)
            } else {
                res.render("list", {
                    listTitle: foundList.name,
                    items: foundList.items
                })
            }
        }
    })
})

app.get("/about", function (req, res) {
    res.render("about")
})

app.post('/', function (req, res) {

    let itemName = req.body.newItem
    let listName = req.body.list

    const item = new Item({
        name: itemName
    })

    if (listName === "General") {
        item.save()
        res.redirect("/")
    } else {
        List.findOne({
            name: listName
        }, function (err, foundList) {
            foundList.items.push(item)
            foundList.save()
            res.redirect("/" + listName)
        })
    }
})

app.post("/delete", function (req, res) {
    var checkedItemId = req.body.checkbox
    var listName = req.body.listName

    if (listName === "General") {
        Item.findByIdAndRemove(checkedItemId, function (err) {
            console.log("Successfully deleted")
            res.redirect("/")
        })
    } else {
        List.findOneAndUpdate({
            name: listName
        }, {
            $pull: {
                items: {
                    _id: checkedItemId
                }
            }
        }, function (err, foundList) {
            res.redirect("/" + listName)
        })
    }
})

app.listen(process.env.PORT || 3000, function () {
    console.log("server running")
})