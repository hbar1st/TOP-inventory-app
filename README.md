# TOP-inventory-app
## An inventory app for TOP practice

**[Live App Link](top-inventory-app-production-69b2.up.railway.app "Perfume Inventory App")**

### Must-have features:

- A way to do CRUD on all categories and perfumes;
- A way to view by category (and their total counts).
- A way to view all inventory (and their counts).
- If a category is removed, it removes all the perfumes attached that no longer have a category set up. 

### Bonus features:

- Make it pretty.
- Request a password before allowing updates or deletes.

### My own list of features:

- A way to view all inventory by brand (and total count per brand).
- A way to view out-of-stock perfumes (in general, or by brand or by category).
- A way to do CRUD on all categories/brands & perfumes;
- Support perfumes belonging to more than one category.
- Support perfumes purchased at more than one price.
- Mobile support.
- If a brand is removed, it removes all the perfumes attached to it.
- Search by name, description, brand or category_name.
- Add a feature to show average purchase price for stock by perfume.

### Nice to have:

- Add a menu icon that shows a drop down menu that lets us go to All Items, Brands, & Categories
- Figure out a way to limit query results so we're displaying them by a set limit (say 50 items each time). This means we need a way to 'view more' and a way 'see previous' or 'go back' to view the previous page of results? That's a routing problem?
- Create a way to bulk remove rows of perfumes from the items view. (by selecting the rows one wants to remove then running the delete)
- Create a way to bulk edit rows of perfumes by selecting the perfumes then being shown a dialog that lets you modify fields and 'apply to all' and showing how many rows were selected to confirm the update. (Maybe I want to change the name of the brand in bulk for eg)
- A way to download the data in a csv file
- A way to uploade data from a csv file

TODO:
[ ] add the date created and date updated to queries so they show up with the perfume details\
[ ] create a font package and include it into the repo (then replace appropriate code)