var searchBar = document.getElementById("searchbar");

// Start searching _____________________________________________________________

/**
 * Opens the map page passing the search as query
 * 
 * @param {string} inputText String for the research
 */
function searchPlace(inputText)
{
    // Do nothing if the search text is empty
    if(inputText.split(' ').join('') === '')
    {
        return;
    }

    // Getting rid of the whitespaces
    var q = inputText.split(' ').join('+');

    var url = "map.html?q=" + q;
    window.open(url, "_self");
}

searchBar.addEventListener("keydown", (e) =>  {
    if(e.key === "Enter")
    {
        searchPlace(searchBar.value)
    }
})