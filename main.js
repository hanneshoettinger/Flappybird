
var lastFrameTimeMs = 0; // The last time the loop was run
var maxFPS = 60; // The maximum FPS we want to allow
var delta=0;
 
var score=[0,0,0]; 
var scorebox;
 
 var gravity = 10;
 var flapstrength = 20;
 
 var flapcntr = 0;
 var flapp;
 var maxflap = 10;
 var rotation = 0;
 
 var flapanimcntr=0;
 var flappanim;
 var maxflapanim = 60;
 
var bird;
var birdy; 
var birdvelocity = 0;
var maxvelocity = 20;
var birdrotation;
  
var pause = true;
var gameover = false;

var pillarspawner;
var nextpillar = Math.floor(Math.random() * 3000) + 500; 
var pillars;
var activepillars = [0,0,0];
var pillarspeed = 100;

var floor;
var overlay;
var button;  
var logo;
var windowx;

function init()
{
    overlay = document.getElementById("overlay");
    floor = document.getElementById("floor");
    bird = document.getElementById("bird");
    scorebox = document.getElementById("score");
    birdy = parseInt(document.getElementById("bird").offsetTop);
    button = document.getElementById("play");
    logo = document.getElementById("logo");
    pillars = document.getElementsByClassName("pipe"); 
    windowx = $("#window").offset().left; 
    setScore();
}
function reset()
{
    birdy = 243;
    birdvelocity = 0;
    for(var i=0;i<2;i++)
    {
        activepillars[i] = 1;    
        $(pillars[i]).offset({ top:  $(pillars[i]).offset().top, left: windowx-61 }); 
    }
    clearpillars();
    floor.className ="animatedfloor";
    button.className="invisible";
    logo.className="invisible";
    overlay.className=" ";
    score = [0,0,0]; 
    setScore();   
    gameover = false;  
}
 function update()
 {  
    if(!gameover)
    {
        clearpillars();
        var coll; 
        for(var i=0; i<2; i++)
        {
            coll = CircleAABBCpl(bird,pillars[i])
            if(coll)
            { 
                var top    = $(pillars[i]).find(".pipe-top");
                var bottom = $(pillars[i]).find(".pipe-bottom");
                if(CircleAABBCpl(bird,top))
                {
                    gameover = true;
                    button.className="visible";
                    logo.className="visible";
                    floor.className ="noanimatedfloor";
                    overlay.className="animatedOverlay";
                    return;
                }    
                if(CircleAABBCpl(bird,bottom))
                {
                    gameover = true;
                    button.className="visible";
                    logo.className="visible";
                    floor.className ="noanimatedfloor";
                    overlay.className="animatedOverlay";
                    return;
                }  
                if($(pillars[i]).attr("counted") == 0)
                {
                    increaseScore();
                    setScore();
                }
                $(pillars[i]).attr("counted",1);   
            }
        }
        if(flapcntr > maxflap)
        {
            clearInterval(flapp);
            flapcntr = 0;
        }
        if(flapanimcntr > maxflapanim)
        {
            clearInterval(flappanim);
            flapanimcntr = 0;
            bird.className = "";
        }
        
        var x =0;
        var y =0;
        for(var i=0;i<2;i++)
        {
            if(activepillars[i] == 1)
            {
                x = $(pillars[i]).offset().left - (pillarspeed * delta);
                y = $(pillars[i]).offset().top;
                $(pillars[i]).offset({ top: y, left: x });  
            }
        }
         
     }
     if(birdy > 455)
     {
          gameover = true;
          button.className="visible";
          logo.className="visible";
          floor.className ="noanimatedfloor";
          overlay.className="animatedOverlay";
          birdvelocity =0; 
     } 
     else
     {
        birdvelocity += gravity * delta;
        birdy += birdvelocity;  
        
        //update bird rotation
        rotation = Math.min((birdvelocity / 20) * 90, 90);   
        $("#bird").css({transform: 'rotate('+rotation+'deg)'})

     } 
     if(birdy < 0)
     {
         birdy = 1;
         birdvelocity = 0;
         clearFlaps();
     } 

 }
 function draw()
 {
    bird.style.top = birdy+"px"; 
    for(var i=0;i<2;i++)
    {
        pillars[i].style.left = pillars[i].style.offsetLeft;
    }
 }
 function overlord()
{
    init();
    requestAnimationFrame(mainLoop);
}

// start mainloop
$( document ).ready(function() {
    overlord();

    $(document).keydown(function(e){
        if(e.keyCode == 32 && !gameover)
        {
            screenClick();
        }
    });
    //Handle mouse
    if("ontouchstart" in window)
        $(window).on("touchstart", screenClick);
    else
        $(window).on("mousedown", screenClick);
    
    $( document ).on('click',"#play" ,function() {
        console.log("working");
        reset();
    });
});


function screenClick()
{
    if(!gameover)
    {
        if(pause)
        { 
            pause = false;
            button.className="invisible";
            logo.className="invisible";
            pillarspawner = setInterval(function(){ 
                SpawnPillar();     
            }, nextpillar);
        }

        flap();
    }
}

//=============================================================================
//Main
//=============================================================================

function mainLoop(timestamp) {
    if (timestamp < lastFrameTimeMs + (1000 / maxFPS)) {
        requestAnimationFrame(mainLoop);
        return;
    }
    if(!pause)
    {
        update();
    }
    draw();
    delta = (timestamp - lastFrameTimeMs) / 1000;
    lastFrameTimeMs = timestamp;
    requestAnimationFrame(mainLoop);
}

//=============================================================================
//Pillars
//=============================================================================
function SpawnPillar()
{
    var x = 0;
    var y = 0;
    for(var i=0; i< 2; i++)
    {
        if(activepillars[i] == 0)
        {
            pillars[i].className="pipe visible";
            x = windowx + 320;           
            y = -1* (Math.floor(Math.random() * 120) + 110); 
            $(pillars[i]).offset({ top: y, left: x });  
            activepillars[i] =1;
            $(pillars[i]).attr("counted",0);
            clearInterval(pillarspawner);
            nextpillar = Math.floor(Math.random() * 2000) + 1500; 
            pillarspawner = setInterval(function(){ 
                        SpawnPillar();      
            }, nextpillar);
            return;  
        }
    }
}
function clearpillars()
{
    for(var i=0; i< 2; i++)
    {
        if(activepillars[i] == 1)
        {
            if($(pillars[i]).offset().left < windowx-60)
            {
                activepillars[i]=0;
                $(pillars[i]).attr("counted",0);   
            }
        }
    }
}

//=============================================================================
//FLAPS
//=============================================================================

function flap()
{ 
     clearFlaps();
     flapp = setInterval(function(){
          if(Math.abs(birdvelocity) < maxvelocity)
          { 
              birdvelocity -= flapstrength  * delta;
          }
          flapcntr++;       
     }, 1000 / maxFPS);
     flappanim = setInterval(function(){ 
        bird.className = "animatedbird";
        flapanimcntr++;
     }, 1000 / maxFPS);
 }


function clearFlaps()
{
    clearInterval(flapp);
    flapcntr = 0;
    clearInterval(flappanim);
    flapanimcntr = 0;
    bird.className = "";
}

//=============================================================================
//Collision
//=============================================================================
function CircleAABBCpl(circle, aabb)
{   
    var radius = parseInt($(circle).css("width"))/2;
    
    var center=[0,0]; 
    center[0] = $(circle).offset().left + radius /2;
    center[1] = $(circle).offset().top + radius /2;
    
    var pt=[0,0];     
    pt[0] = $(circle).offset().left + radius /2;
    pt[1] = $(circle).offset().top + radius /2;
    
    var aabbEdges = [0,0,0,0];
    aabbEdges[0] =  $(aabb).offset().left;
    aabbEdges[1] =  $(aabb).offset().left + parseInt($(aabb).css("width"));
    aabbEdges[2] =  $(aabb).offset().top;
    aabbEdges[3] =  $(aabb).offset().top + parseInt($(aabb).css("height"));
    
    if(pt[0] < aabbEdges[0]) pt[0] = aabbEdges[0];
    if(pt[0] > aabbEdges[1]) pt[0] = aabbEdges[1];
    if(pt[1] < aabbEdges[2]) pt[1] = aabbEdges[2];
    if(pt[1] > aabbEdges[3]) pt[1] = aabbEdges[3];

    if(distance(pt, center) < (radius*radius)) return true;
    return false;
}

function distance(pt, circle)
{
    var temppt =[0,0];
    temppt[0] = Math.abs(pt[0]-circle[0]);
    temppt[1] = Math.abs(pt[1]-circle[1]);
    
   var dist = temppt[0]*temppt[0] + temppt[1]*temppt[1];
   return dist;
    
}

//=============================================================================
//SCORE
//=============================================================================

 function setScore()
 {
     if(score[0] == 0 && score[1] == 0 && score[2] == 0)
     {
         scorebox.innerHTML = scorebox.innerHTML + "<div class='numbers -"+score[0]+"'></div>";
     }
     if(score[0] >= 0)
     {
         scorebox.innerHTML ="<div class='numbers _"+score[0]+"'></div>";
     }
     if(score[1] > 0 )
     {
         scorebox.innerHTML ="<div class='numbers _"+score[1]+"'></div> <div class='numbers _"+score[0]+"'></div>";
     }
     if(score[2]> 0 )
     {
         scorebox.innerHTML ="<div class='numbers _"+score[2]+"'></div><div class='numbers _"+score[1]+"'></div> <div class='numbers _"+score[0]+"'></div>";
     }
     
 }function increaseScore()
{
    score[0]++
    if(score[0]==10)
    {
        score[0]=0;
        score[1]++;
    }
    if(score[1]==10 && score[0] > 0)
    {
        score[1]=0;
        score[2]++;
    }
    if(score[2] == 10)
    {
        score[0]=0;
        score[1]=0;
        score[2]=0;
    }
}