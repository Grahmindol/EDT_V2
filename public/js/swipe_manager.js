let x0 = null;
function unify(e) { return e.changedTouches ? e.changedTouches[0] : e; }
function lock(e) { x0 = unify(e).clientX; }
function move(e) {
    if (x0 !== null) {
        let dx = unify(e).clientX - x0, s = Math.sign(dx);
        current_day -= s;

        if (document.querySelector('.w-schedule__days').style.getPropertyValue('--i') == '')
            document.querySelector('.w-schedule__days').style.setProperty('--i', 0)
        console.log(document.querySelector('.w-schedule__days').style.getPropertyValue('--i'))
        let i = parseInt(document.querySelector('.w-schedule__days').style.getPropertyValue('--i')) - s;

        /*if (i <= 0) {
            i = 0;
            requestDayData(current_day - 1);
        }
        if (i >= n) {
            i = n;
            requestDayData(current_day + 1);
        }*/
        console.log(i)
        document.querySelector('.w-schedule__days').style.setProperty('--i', i);
        x0 = null;
    }
}
function preventDefault(e) { e.preventDefault(); }

function swipe_setup() {
    const _C = document.querySelector('.w-schedule__days');
    _C.style.setProperty('--n', document.querySelector(".js-tabs__panels").childElementCount);

    _C.addEventListener('mousedown', lock);
    _C.addEventListener('touchstart', lock);
    _C.addEventListener('touchmove', preventDefault, { passive: false });
    _C.addEventListener('mouseup', move);
    _C.addEventListener('touchend', move);
}

function swipe_stop() {
    const _C = document.querySelector('.w-schedule__days');
    _C.style.removeProperty('--i');

    _C.removeEventListener('mousedown', lock);
    _C.removeEventListener('touchstart', lock);
    _C.removeEventListener('touchmove', preventDefault);
    _C.removeEventListener('mouseup', move);
    _C.removeEventListener('touchend', move);
}

if (!window.matchMedia("(min-width: 64rem)").matches) swipe_setup();
window.matchMedia("(min-width: 64rem)").addEventListener("change", e => e.matches ? swipe_setup() : swipe_stop());

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("a").forEach(link => {
        link.setAttribute("draggable", "false");
        link.addEventListener("dragstart", e => e.preventDefault());
    });
});