"use strict";

/* ===============================
NAVBAR SCROLL EFFECT
=============================== */

const navbar = document.getElementById("navbar");

window.addEventListener("scroll", function(){

if(navbar){
navbar.classList.toggle("scrolled", window.scrollY > 40);
}

});


/* ===============================
MOBILE MENU
=============================== */

const hamburger = document.getElementById("hamburger");
const mobileNav = document.getElementById("mobileNav");
const mobileClose = document.getElementById("mobileClose");

function openMenu(){

if(!mobileNav) return;

mobileNav.classList.add("active");

document.body.style.overflow = "hidden";

}

function closeMenu(){

if(!mobileNav) return;

mobileNav.classList.remove("active");

document.body.style.overflow = "";

}


if(hamburger){

hamburger.addEventListener("click", function(e){

e.stopPropagation();

openMenu();

});

}


if(mobileClose){

mobileClose.addEventListener("click", closeMenu);

}


/* close when clicking outside */

document.addEventListener("click", function(e){

if(
mobileNav &&
mobileNav.classList.contains("active") &&
!mobileNav.contains(e.target) &&
!hamburger.contains(e.target)
){

closeMenu();

}

});


/* ===============================
SMOOTH SCROLL
=============================== */

document.querySelectorAll('a[href^="#"]').forEach(anchor => {

anchor.addEventListener("click", function(e){

const target = document.querySelector(this.getAttribute("href"));

if(target){

e.preventDefault();

window.scrollTo({
top: target.offsetTop - 80,
behavior: "smooth"
});

}

});

});


/* ===============================
ACTIVE NAV LINK
=============================== */

function setActiveNavLink(){

const path = window.location.pathname.split("/").pop() || "index.html";

document.querySelectorAll(".nav-links a").forEach(link => {

const href = link.getAttribute("href");

if(href === path){
link.classList.add("active");
}else{
link.classList.remove("active");
}

});

}

setActiveNavLink();



/* ===============================
FOOTER YEAR
=============================== */

document.querySelectorAll(".year").forEach(el=>{
el.textContent = new Date().getFullYear();
});
<script src="script.js"></script>
