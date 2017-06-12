/*

// Side note ==> (I should maybe be using a userId instead of just the name. It's more professional)

//// Code for when review is submitted


 let pendingUser = req.body.username

 let alreadyCommented = false

 Recipe.findById({_id: recipeId}, (err, recipeId) => {

 let recipe = res.json(recipe);

 let recipeObj = JSON.parse(recipe);

 for (let i = 0; i < recipeObj.reviews.length; i++) {

 if (recipeObj.reviews[i].postedBy === pendingUser){

 alreadyCommented = true;
 }
 }
 })

 if (!alreadyCommented) {

 Recipe.findByIdAndUpdate({_id: recipeId}, (err, recipe) => {

 if (err) throw err;

 Recipe.update({_id: recipe._id}, {$push: {"reviews": {itemId: recipeId, rating: req.body.rating, comment: req.body.comment, postedBy: pendingUser}}},
 (err, recipe) => {

 res.json(recipe);
 }

 }

 User.findAndUpdate({username: pendingUser}, {$push: {"usersReviews": {itemId: recipeId, rating: req.body.rating, comment: req.body.comment}}},
 (err, user) => {
    if (err) throw err;

    res.json(user);
 })


 // if the rating in that review is 4 or 5, then the recipe is added to the liked recipes Array in the reviewers Schema
 document. In addition, the person who submitted the recipe has 1 added to their chefKarma in their user document. On
 the other hand, if the reviewer gave the dish a 1 or 2, then the person who submitted the recipe loses 1 point to their
 chefKarma property


 }

 I should also have code that updates the average rating and so forth after this. I'll finish this section later


 /// deleting a review


    /// lets first fetch the review itself

    /// the function is built assuming that a req.body of the contents of the review is sent,

    let reviewedRecipeId = req.body.itemId;

    let reviewingUser = req.body.postedBy;

    Recipe.update({_id: reviewedRecipeId}, {$pull: {"reviews": {postedBy: reviewingUser}}}, (err, recipe) =>{
        if (err) throw err;

        res.json(recipe)
    });

    /// Then recalculate the mean average for that recipe. Hopefully I'll have a better idea to do this once I clarify
    some things. (Can I use a function that is embedded within a document?)

    /// now let's update the User Document

    User.update({username: reviewingUser}, {$pull: {"usersReviews": {itemId: reviewedRecipeId}}}, (err, user) => {

        if (err) throw err;

        res.json(user)


    })






Reconsiderations: Maybe it is not a good idea for a the alreadyCommented function to only govern whether
a user can just submit a comment or not. The above could obvioly will not be a hundred percent like the final version.






 //// creating a Recipe

        // the function for creating a Recipe has become very screwy. Let's redo it with the added some added versatility.






*/
