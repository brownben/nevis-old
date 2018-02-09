
//////////////////////////////////////////////////////////////////
//                          main-menu.js                        //
//////////////////////////////////////////////////////////////////

// Set up main menu and links between screens                   //

const results = require('./Results-Functions.js')

function displayNothing (){
	document.getElementById('main-screen').setAttribute('style', 'display:none;')

	document.getElementById('menu-panel').setAttribute('style', 'display:none;')
	document.getElementById('main-menu').setAttribute('style', 'display:none;')
	document.getElementById('back').setAttribute('style', 'display:none;')

	document.getElementById('download-output').setAttribute('style', 'display:none;')
	document.getElementById('download-menu').setAttribute('style', 'display:none;')

	document.getElementById('entries').setAttribute('style', 'display:none;')
	document.getElementById('entry-search').setAttribute('style', 'display:none;')
	document.getElementById('entries-menu').setAttribute('style', 'display:none;')
	document.getElementById('entries-add-menu').setAttribute('style', 'display:none;')
	document.getElementById('entries-update-menu').setAttribute('style', 'display:none;')
	document.getElementById('entry-download').setAttribute('style', 'display:none')

	document.getElementById('about').setAttribute('style', 'display:none;')

	document.getElementById('courses-page').setAttribute('style', 'display:none;')
	document.getElementById('courses-menu').setAttribute('style', 'display:none;')

	document.getElementById('results').setAttribute('style', 'display:none;')
	document.getElementById('results-menu').setAttribute('style', 'display:none;')
}

// Set Up Welcome Screen
displayNothing()
document.getElementById('main-screen').setAttribute('style', 'display:block;')
document.getElementById('menu-panel').setAttribute('style', 'display:block;')

// If Download Clicked
document.getElementById('menu-download').addEventListener('click', function () {
    ipc.send('resize', 0);
	displayNothing()
    document.getElementById('back').setAttribute('style', 'display:block;')
    document.getElementById('download-output').setAttribute('style', 'display:block;')
    document.getElementById('download-menu').setAttribute('style', 'display:block;')
})

// If Entries Clicked
document.getElementById('menu-entries').addEventListener('click', function () {
    ipc.send('resize', 0);
	displayNothing()
    document.getElementById('entry-search').setAttribute('style', 'display:block;')
    document.getElementById('back').setAttribute('style', 'display:block;')
    document.getElementById('entries-menu').setAttribute('style', 'display:block;')  
})
// If About Clicked
document.getElementById('menu-about').addEventListener('click', function () {
    ipc.send('resize', 0);
	displayNothing()  
    document.getElementById('back').setAttribute('style', 'display:block;')   
    document.getElementById('about').setAttribute('style', 'display:block;')

})
// If Courses Clicked
document.getElementById('menu-courses').addEventListener('click', function () {
    ipc.send('resize', 0);
	displayNothing()
    document.getElementById('back').setAttribute('style', 'display:block;')
    document.getElementById('courses-page').setAttribute('style', 'display:block;')
    document.getElementById('courses-menu').setAttribute('style', 'display:block')
})

// If Results Clicked
document.getElementById('menu-results').addEventListener('click', function () {
    ipc.send('resize', 0);
	displayNothing()
    results.refreshResults()
    document.getElementById('back').setAttribute('style', 'display:block;')
    document.getElementById('results').setAttribute('style', 'display:block;')
    document.getElementById('results-menu').setAttribute('style', 'display:block;')
});

// If Back Clicked
document.getElementById('back-button').addEventListener('click', function () {
    ipc.send('resize', 0);
    if (document.getElementById('entries-add-menu').getAttribute('style') == 'display:block;') {
		displayNothing()
        document.getElementById('entries-menu').setAttribute('style', 'display:block;')
        document.getElementById('entry-search').setAttribute('style', 'display:block;')
    }
    else if (document.getElementById('entries-update-menu').getAttribute('style') == 'display:block;') {
		displayNothing()
        document.getElementById('entries-menu').setAttribute('style', 'display:block;')
        document.getElementById('entry-search').setAttribute('style', 'display:block;')
    }
    else {
		displayNothing()
        document.getElementById('main-screen').setAttribute('style', 'display:block;')
        document.getElementById('main-menu').setAttribute('style', 'display:block;')
    }
});
