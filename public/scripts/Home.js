const image = document.getElementById('hoverImage');

image.addEventListener('mouseover', function () {
    image.src = './Documents/IOT-hover.png';
});

image.addEventListener('mouseout', function () {
    image.src = './Documents/IOT.png';
});