///////////////////////////
//
// base JS
//
///////////////////////////

var screenWidth = window.innerWidth;
var curState = getSection();
// document & window events

(function(){

    document.addEventListener("DOMContentLoaded", function(event) {
        //fade images once content is loaded
        var figures = document.getElementsByClassName('image-high');
        for (var i = 0; i < figures.length; i++) {
            loadImageBackground(figures[i]);
        }

        var videoElms = document.querySelectorAll('.tile video');
        for (var i = 0; i < videoElms.length; i++) {
            var videoObj = setVideoSource(videoElms[i]);
        }

        var pageLocation = (window.location.href).split('?=').pop();
        if (pageLocation.indexOf('.') === -1) {
            if (pageLocation.indexOf('project') !== -1) {
                var project = pageLocation.split('project/').pop();
                buildProject(project);
            } else {
                updatePage(pageLocation);
                setSection(pageLocation);
                setActiveLink(pageLocation);
            }

        }


        //set email and phone data after page load
        var emailLinks = document.querySelectorAll('.email-link');
        var phoneLinks = document.querySelectorAll('.phone-link');
        for (var i = 0; i < emailLinks.length; i++) {
            emailLinks[i].textContent = 'wsoeltz@gmail.com';
            emailLinks[i].setAttribute('href', 'mailto:wsoeltz@gmail.com');
        }
        for (var i = 0; i < phoneLinks.length; i++) {
            phoneLinks[i].textContent = '508.517.6476';
            phoneLinks[i].setAttribute('href', 'tel:508-517-6476');
        }

    });


    document.onscroll = function(){
        var scrollTop = getScrollPostion();

        var glacierPeakImg = document.getElementById('glacier-peak');
        philosophyJs.fadeImages(scrollTop, screenWidth, glacierPeakImg);

        var section = getSection();
        updateNav(scrollTop, section);
    };


    window.onresize = function() {
        screenWidth = window.innerWidth;
    }


    // sets event listeners for all of the nav links
    var navLinks = document.querySelectorAll('.main-nav a');
    for (var i = 0; i < navLinks.length; i++) {
        navLinks[i].addEventListener('click', function(event) {
            event.preventDefault();
            var state = (this.getAttribute('href')).split('?=').pop();
            pushSection(state);
            updatePage(state);
            setActiveLink(state);
        });
    }

    document.querySelector('.current-year').textContent = (new Date()).getFullYear();


    var portfolioLinks = document.querySelectorAll('.tile');
    for (var i = 0; i < portfolioLinks.length; i++) {
        portfolioLinks[i].addEventListener('click', function(event) {
            event.preventDefault();
            var project = (this.getAttribute('id')).split('-tile').shift();
            buildProject(project);
            pushSection('project/' + project);
        });
    }

    window.addEventListener('keyup', function(event) {
        if (event.keyCode === 27 || event.key === 'Escape' || event.which === 27) {
            closeProject(event);
        }
    });


    window.addEventListener('popstate', function(event) {
        console.log('popped');
        var state = event.state.id;
        if (state.indexOf('project') === -1) {
            closeProject(event);
        } else {
            var project = (event.state.id).split('project/').pop();
            buildProject(project);
        }
    });


})();

function buildProject(project) {
    //get the triggering element and get its dimensions and location
    var triggerBtn = document.getElementById(project + '-tile');
    console.log(triggerBtn);
    var cardDimensions = {
        width : triggerBtn.offsetWidth,
        height : triggerBtn.offsetHeight,
        top : getOffsetTop( triggerBtn ) - getScrollPostion(),
        left : getOffsetLeft( triggerBtn )
    }

    var projectView = {
        container: document.createElement('section'),
        content: document.createElement('article'),
        overlay: document.createElement('button'),
        header: document.createElement('header'),
        coverPhotoContainer: document.createElement('figure'),
        coverPhotoLow: document.createElement('div'),
        coverPhotoHigh: document.createElement('div'),
        title: document.createElement('h1'),
        subtitle: document.createElement('h2'),
        contributions: document.createElement('ul')
    };

    projectView.container.appendChild(projectView.overlay);
    projectView.container.appendChild(projectView.content);

    //general styling for the project
    projectView.container.classList.add('project-container');
    projectView.overlay.classList.add('overlay');
    projectView.overlay.style.opacity = 0;
    projectView.overlay.textContent = 'Close';

    //add event listener to overlay in order to close project
    projectView.overlay.addEventListener('click', function(event) {
        closeProject(event);
    });

    // projectView.createProject();

    //set css for content container before applying it to the page
    projectView.container.style.cssText = 'width:' + cardDimensions.width + 'px;height:' + cardDimensions.height + 'px;top:' + cardDimensions.top + 'px;left:' + cardDimensions.left + 'px;padding:0;';

    //apply project to page and then remove inline css in order to animate it
    document.getElementById('main-content').appendChild(projectView.container);
    setTimeout(function(){
        projectView.container.style.cssText = '';
        projectView.overlay.style.cssText = '';
        document.querySelector('body').classList.add('no-scroll');
    }, 100);

    loadJSON('../assets/projects/' + project + '.json',
        function(data) {


            //build project content
            projectView.title.textContent = data.title;
            projectView.subtitle.textContent = data.subtitle;

            projectView.coverPhotoHigh.dataset.image = '/assets/img/case-studies/' + data.id + '/' + data.coverPhoto;
            projectView.coverPhotoLow.style.backgroundImage = 'url("/assets/img/case-studies/' + data.id + '/' + data.coverPhotoLow + '")';
            projectView.coverPhotoContainer.appendChild(projectView.coverPhotoLow);
            projectView.coverPhotoContainer.appendChild(projectView.coverPhotoHigh);

            projectView.header.appendChild(projectView.coverPhotoContainer);
            loadImageBackground(projectView.coverPhotoHigh);

            projectView.header.appendChild(projectView.title);
            projectView.header.appendChild(projectView.subtitle);
            projectView.contributions.classList.add('project-parts');
            for (var i = 0; i < data.contributions.length; i++) {
                var newLi = document.createElement('li');
                newLi.textContent = data.contributions[i];
                newLi.classList.add(data.contributions[i].toLowerCase().replace(/\s+/g, '-'));
                projectView.contributions.appendChild(newLi);
            }
            projectView.header.appendChild(projectView.contributions);
            var introHeading = document.createElement('h3');
            introHeading.textContent = data.content[0].heading;
            projectView.header.appendChild(introHeading);
            projectView.header.insertAdjacentHTML('beforeend', data.content[0].text);

            projectView.content.appendChild(projectView.header);

            for (var i = 1; i < data.content.length; i++) {
                var newDiv = document.createElement('div');
                newDiv.classList.add('project-section');
                newDiv.classList.add(data.content[i].style);
                if (data.content[i].style !== 'image-panel-fixed') {
                    newDiv.insertAdjacentHTML('beforeend', '<h3>' + data.content[i].heading + '</h3>' + data.content[i].text);
                }
                var newFigure = document.createElement('figure');
                var newImage = document.createElement('img')
                newImage.src = '/assets/img/case-studies/' + data.id + '/' + data.content[i].image;
                newFigure.appendChild(newImage);
                newDiv.appendChild(newFigure);
                projectView.content.appendChild(newDiv);
            }

        },
        function(xhr) { console.error(xhr); }
    );
}

function closeProject(event) {
    var project = document.querySelector('.project-container');
    if (project) {
        document.getElementById('main-content').removeChild(project);
        document.querySelector('.no-scroll').classList.remove('no-scroll');
        if (event.type !== 'popstate') {
            pushSection((getSection()).state);
        }
    }
}

// gets the current postion of the window relative to the document
function getScrollPostion() {
    return (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
}


// update the appearence of the nav and set the section
function updateNav(scrollY, section) {
    var nav = document.getElementById('main-nav');
    if (scrollY > 1700) {
        nav.classList.remove('philosophy');
    } else {
        if (!nav.classList.contains('philosophy')) {
            nav.classList.add('philosophy');
        }
    }

    if (curState !== section.state) {
        setActiveLink(section.state);
        curState = section.state;
        setSection(section.state);
    }

}

function setActiveLink(state) {
    var activeLink = document.querySelector('#main-nav .active');
    if (activeLink) {
        activeLink.classList.remove('active');
    }
    document.getElementById('nav-item-' + state).classList.add('active');
}


// return information about the current section
function getSection() {
    var scrollTop = getScrollPostion();
    var buffer = 300;
    var sections = document.querySelectorAll('section.page-section');
    var sectionsTops = [];
    for (var i = 0; i < sections.length; i++) {
        sectionsTops[i] = getOffsetTop(sections[i]) - buffer;
    }
    for (var i = 0; i < sections.length; i++) {
        if (scrollTop < sectionsTops[1]) {
            return {
                state: sections[0].getAttribute('id'),
                top: 0
            };
        } else if (scrollTop > sectionsTops[sections.length - 1]) {
            return {
                state: sections[sections.length - 1].getAttribute('id'),
                top: sectionsTops[sections.length - 1]
            };
        } else if (scrollTop >= sectionsTops[i] && scrollTop < sectionsTops[i + 1]) {
            return {
                state: sections[i].getAttribute('id'),
                top: sectionsTops[i]
            };
        }
    };

    return {
        state: 'philosophy',
        top: 0
    };
}

// replace the current history state with the new section
function setSection(section) {
    history.replaceState({
        id: section
    }, 'Kyle Soeltz - Senior UX Developer', '?=' + section);
    curState = section;
}


// push a new history state for the current section
function pushSection(section) {
    history.pushState({
        id: section
    }, 'Kyle Soeltz - Senior UX Developer', '?=' + section);
    curState = section;
}


// scroll the page to target section
function updatePage(section) {
    window.scrollTo(0, getOffsetTop( document.getElementById(section) ) + 10 );
}

// gets the position of an element relative to the document
function getOffsetTop( elm )
{
    var offsetTop = 0;
    do {
      if ( !isNaN( elm.offsetTop ) )
      {
          offsetTop += elm.offsetTop;
      }
    } while( elm = elm.offsetParent );
    return offsetTop;
}
// gets the position of an element relative to the document
function getOffsetLeft( elm )
{
    var offsetLeft = 0;
    do {
      if ( !isNaN( elm.offsetLeft ) )
      {
          offsetLeft += elm.offsetLeft;
      }
    } while( elm = elm.offsetParent );
    return offsetLeft;
}

// JSON Call
// https://stackoverflow.com/questions/9838812/how-can-i-open-a-json-file-in-javascript-without-jquery
function loadJSON(path, success, error)
{
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function()
    {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                if (success)
                    success(JSON.parse(xhr.responseText));
            } else {
                if (error)
                    error(xhr);
            }
        }
    };
    xhr.open("GET", path, true);
    xhr.send();
}

// Fading images function
//  - once the highres images load,
//    fade out the lowres one
//
//////////////////////////
function loadImageBackground(obj) {

    var bgImage = new Image();
    bgImage.src = obj.dataset.image;


    bgImage.onload = function() {
        obj.style.backgroundImage = 'url("' + obj.dataset.image + '")';
        var prevObj;
        if (prevObj = obj.parentElement.previousElementSibling) {
            prevObj.classList.add('fade');
        } else if (prevObj = obj.previousElementSibling) {
            prevObj.classList.add('fade');
        }
    }

}

function loadImageFigure(obj) {

    var bgImage = new Image();
    bgImage.src = obj.dataset.image;


    bgImage.onload = function() {
        obj.src = obj.dataset.image;
        var prevObj;
        prevObj.classList.add('fade');
        // if (prevObj = obj.parentElement.previousElementSibling) {
        // }
    }

}


// load videos
function setVideoSource(videoObj) {
    var sourcePrimary = document.createElement('source');
    var sourceSecondary = document.createElement('source');
    sourcePrimary.setAttribute('src', videoObj.dataset.sourcePrimary);
    sourcePrimary.setAttribute('type', 'video/mp4');
    sourceSecondary.setAttribute('src', videoObj.dataset.sourceSecondary);
    sourceSecondary.setAttribute('type', 'video/webm');
    videoObj.appendChild(sourcePrimary);
    videoObj.appendChild(sourceSecondary);
}





///////////////////////////
//
// philosophy section
//
///////////////////////////

// Scrolling Images
//

var philosophyJs = {
    fadeImages: function(scrollY, screenWidth, obj) {
        if (scrollY > 400 && screenWidth > 970) {
            obj.style.opacity = 0;
        } else {
            obj.style.opacity = 1;
        }
    }
}