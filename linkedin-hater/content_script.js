const text = document.querySelectorAll('h1, h2, h3, h4, h5, p, li, td, caption, span, a');

for (let i = 0; i < text.length; i++) {
    if (text[i].innerHTML.includes('Tom Brady')) {
        text[i].innerHTML = text[i].innerHTML.replace('Tom Brady', '6-time Super Bowl champion Tom Brady');
    } else if (text[i].innerHTML.includes('Brady')) {
        text[i].innerHTML = text[i].innerHTML.replace('Brady', '6-time Super Bowl champion Tom Brady');
    }
}
