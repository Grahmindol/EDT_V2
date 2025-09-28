function generateScheduleDay(day) {
    const section = document.createElement("section");
    section.id = day.id;
    section.classList.add("w-schedule__day", "js-tabs__panel", "swiper-slide");

    const label = document.createElement("div");
    label.classList.add("w-schedule__col-label", "text-sm");
    label.textContent = day.name;
    section.appendChild(label);

    if (day.events.length) {
        const eventList = document.createElement("ul");
        eventList.classList.add("w-schedule__events");

        day.events.forEach(event => {
            const listItem = document.createElement("li");
            listItem.classList.add("w-schedule__event-wrapper");

            const link = document.createElement("a");
            link.classList.add("w-schedule__event", `w-schedule__event--${event.couleur_id}`, "js-w-schedule__event");
            link.href = "#0";
            link.setAttribute("aria-controls", "w-schedule-modal-id");
            link.setAttribute("data-w-schedule-event", event.couleur_id);

            const time = document.createElement("time");
            time.classList.add("text-sm", "opacity-60%", "text-xs@md");
            time.setAttribute("datetime", event.datetime);

            const title = document.createElement("div");
            title.classList.add("text-md", "font-medium", "text-base@md");
            title.textContent = event.name;

            link.append(time, title);
            listItem.appendChild(link);
            eventList.appendChild(listItem);
        });

        section.appendChild(eventList);
    } else {
        const noClassMsg = document.createElement("p");
        noClassMsg.classList.add("text-center");
        noClassMsg.textContent = "Pas de cours ce jour-là 😮‍💨";
        section.appendChild(noClassMsg);
    }

    return section;
}