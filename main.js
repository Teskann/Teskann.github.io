
var descr = document.getElementById("descr")

/**
 * Change the HTML content of the description field
 * @param {string} htmlContent Content to display in the description field
 */
function changeDescription(htmlContent) {
    descr.innerHTML = htmlContent
}

var defaultDescr = descr.innerHTML;

var urdfast = `<h2>URDFast</h2>
<p>URDFast is a Python program to generate code from URDF XML files to implement a controller for your favorite robot. It comes with a catchy GUI to make its use easier. This tool features code generation for :

<ul>
    <li>Forward transition matrices</li>
    <li>Backward transition matrices</li>
    <li>Forward Kinematics</li>
    <li>Jacobian Matrices (6 x n)</li>
    <li>Center of Mass</li>
    <li>Jacobian of the center of mass (3 x n)</li>
    <li>Polynomial Trajectories generation</li>
    <li>Denavit-Hartenberg parameters support</li>
</ul>

The supported languages for code generation are currently :

<ul>
    <li>Python</li>
    <li>Julia</li>
    <li>MATLAB</li>
</ul>
More languages and features will be added in future versions, make sure to check this repository frequently so you don't miss any update !</p>`

var symi = `<h2>Symi</h2>
<p>Symi is a command-line interface to make symbolic computation easily. It runs under Python and is based on Sympy.</p>
<p>Symi supports all the SymPy functions and syntaxes. Here are some of the main features :

<ul>
    <li>Variables do not need to be declared to be used</li>
    <li>Variable storing</li>
    <li>Implicit multiplications (you can disable it)</li>
    <li>Equation solver</li>
</ul>
</p>
`

var nicevue = `<h2>NiceVue</h2>

<p>What is the farthest place you can see from the top of the Everest ?
NiceVue is a website app for hikers. It allows you to search for any place in the world (mountain peak, building ...). It then prints all the panorama visible from this place on the map.
It includes features like using your current position or view the visible area from the International Space Station in real time.
Even if the project is still in development, I uploaded a first version on my Github Pages :
https://teskann.github.io/nicevue/
</p>

<p>You can find the repository here, but there is at this time no documentation yet (it will come soon) :
https://github.com/Teskann/NiceVue</p>

<p>As I am not a web developer, the website uses pure HTML CSS and JS (no server-side code nor framework like Angular or VueJS).</p>

<p>I intend to create an Android app to make the use of this project possible on mobile phones !</p>`

var docapy = `<h2>Docapy</h2>

<p>Docapy is a tool to generate documentation for your Python projects using the Numpydoc convention. 
Docapy creates HTML files (CSS included) so you can upload your documentation on your own website !</p>`

var matransform = `<h2>Matransform</h2>

<p>Matransform is a tool to visualize 2D matrix transformations with nice animations.</p>

<p>This was inspired by Grant Sanderson's amazing work on Essence of Linear Algebra YouTube videos (on 3blue1brown channel).</p>`

var vectorFieldViewer = `<h2>Vector Field Viewer</h2>

<p>Vector Field Viewer is a tool to display 2D vector fields from a mathematical expression,
 using cartesian or polar coordinate system. It has been made for educational purposes 
 to help students to visualize vector fields.</p>

<p>The code is however not optimized at all (only CPU computing for GUI rendering) 
and not documented. Not good points but come on, it was my first project ever !
Maybe I'll rework on this one some day ...</p>`

var mdtoc = `<h2>mdtoc</h2>

<p>Create tables of contents for your markdown files !</p>`

var razerWaver = `<h2>Razer Waver</h2>

<p>Generate a customizable RGB wave effect for your Razer keyboard on Linux !</p>

<p>OpenRazer does not provide a duration parameter for the wave effect on keyboards.
The default speed is kind of high on multiple devices and it would be cool to slow it down a bit.
Polychromatic provides an effect editor where you can create your own animations for
your keyboard, including a wave. However, this can be long to setup by hand. Use Razer Waver to
create it in a second !</p>`