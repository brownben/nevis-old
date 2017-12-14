//////////////////////////////////////////////////////////////////
//                          main-menu.js                        //
//////////////////////////////////////////////////////////////////

// Set up main menu and links between screens                   //

// Set Up Welcome Screen
document.getElementById('main-menu').setAttribute('style', 'display:block;')
document.getElementById('back').setAttribute('style', 'display:none;')
document.getElementById('download-output').setAttribute('style', 'display:none;')
document.getElementById('download-menu').setAttribute('style', 'display:none;')
document.getElementById('entries').setAttribute('style', 'display:none;')
document.getElementById('entries-menu').setAttribute('style', 'display:none;')
document.getElementById('about').setAttribute('style', 'display:none;')

// If Download Clicked
document.getElementById('menu-download').addEventListener('click', function () {
    document.getElementById('main-menu').setAttribute('style', 'display:none;')
    document.getElementById('back').setAttribute('style', 'display:block;')
    document.getElementById('download-output').setAttribute('style', 'display:block;')
    document.getElementById('download-menu').setAttribute('style', 'display:block;')
    document.getElementById('entries').setAttribute('style', 'display:none;')
    document.getElementById('entries-menu').setAttribute('style', 'display:none;')
    document.getElementById('about').setAttribute('style', 'display:none;')
})

// If Entries Clicked
document.getElementById('menu-entries').addEventListener('click', function () {
    document.getElementById('main-menu').setAttribute('style', 'display:none;')
    document.getElementById('back').setAttribute('style', 'display:block;')
    document.getElementById('download-output').setAttribute('style', 'display:none;')
    document.getElementById('download-menu').setAttribute('style', 'display:none;')
    document.getElementById('entries').setAttribute('style', 'display:block;')
    document.getElementById('entries-menu').setAttribute('style', 'display:block;')
    document.getElementById('about').setAttribute('style', 'display:none;')
})
// If About Clicked
document.getElementById('menu-about').addEventListener('click', function () {
    document.getElementById('main-menu').setAttribute('style', 'display:none;')
    document.getElementById('back').setAttribute('style', 'display:block;')
    document.getElementById('download-output').setAttribute('style', 'display:none;')
    document.getElementById('download-menu').setAttribute('style', 'display:none;')
    document.getElementById('entries').setAttribute('style', 'display:none;')
    document.getElementById('entries-menu').setAttribute('style', 'display:none;')
    document.getElementById('about').setAttribute('style', 'display:block;')
})

// If Back Clicked
document.getElementById('back-button').addEventListener('click', function () {
    document.getElementById('main-menu').setAttribute('style', 'display:block;')
    document.getElementById('back').setAttribute('style', 'display:none;')
    document.getElementById('download-output').setAttribute('style', 'display:none;')
    document.getElementById('download-menu').setAttribute('style', 'display:none;')
    document.getElementById('entries').setAttribute('style', 'display:none;')
    document.getElementById('entries-menu').setAttribute('style', 'display:none;')
    document.getElementById('about').setAttribute('style', 'display:none;')
});
