const accessKey = "k7WafyB240GbvXdwJ5wgeCq4LiceFjnY";
const country = "IT";
const limitEvents = 200;

const eventsEndPoint = (codeCountry) =>
  `https://app.ticketmaster.com/discovery/v2/events?apikey=${accessKey}&locale=*&countryCode=${codeCountry}&size=${limitEvents}&sort=date,asc&city=Milano`;

const venuesCall = `https://app.ticketmaster.com/discovery/v2/venues?apikey=${accessKey}&countryCode=${country}&sort=relevance,asc&size=${limitEvents}`;

const getCurrentEvents = () => {
  $.ajax({
    url: eventsEndPoint(country),
    success: function (dataset) {
      getInfoVenues(dataset);
      getEvents(dataset);
    },
    error: function (error) {
      console.log(error);
    },
  });
};

const createList = (getInfoCurrentVenue) => {
  $.ajax({
    url: eventsEndPoint(country),
    success: function (dataset) {
      const venueInfo = getInfoVenues(dataset);
      const createSections = createSectionCoordinate(venueInfo);
      addMarkerVenue(createSections);

      getCenter(createSections, venueInfo);
      getInfoCurrentVenue(venueInfo);
    },
    error: function (error) {
      console.log(error);
    },
  });
};

function getEvents(dataset, type) {
  const infoEvent = dataset._embedded.events.map((event) => {
    const {
      id: idVenue,
      name: nameVenue,
      location,
    } = event._embedded.venues[0];

    let coordinatesStr =
      location !== undefined &&
      location !== null &&
      location !== false &&
      Object.values(location);

    if (coordinatesStr === false) {
      coordinatesStr = [0, 0];
    }

    const cleanCoordinate = coordinatesStr
      .filter((c) => c)
      .map((coordinate) => Number(coordinate));

    type === "icon" && cleanCoordinate.push(200);

    return {
      idVenue,
      nameVenue,
      cleanCoordinate,
    };
  });

  return infoEvent;
}

function getInfoVenues(dataset) {
  const infoEvent = dataset._embedded.events.map((event) => {
    const {
      id: idVenue,
      name: nameVenue,
      city,
      location,
    } = event._embedded.venues[0];

    let coordinatesStr =
      location !== undefined &&
      location !== null &&
      location !== false &&
      Object.values(location);
    if (coordinatesStr === false) {
      coordinatesStr = [0, 0];
    }

    const cleanCoordinate = coordinatesStr
      .filter((c) => c)
      .map((coordinate) => Number(coordinate));

    return {
      idVenue,
      nameVenue,
      cleanCoordinate,
      event,
    };
  });

  const filteredCoordinates = infoEvent.filter((event) => {
    return event.cleanCoordinate.length > 0;
  });
  const idsVenues = filteredCoordinates.map((event) => event.idVenue);

  const eventGroupped = {};

  idsVenues.forEach((id) => {
    return (eventGroupped[id] = filteredCoordinates.filter((event) => {
      return event.idVenue === id;
    }));
  });

  return eventGroupped;
}

function createSectionCoordinate(dataset) {
  const ids = Object.keys(dataset);
  const container = {};

  ids.forEach((id) => {
    return (container[id] = {
      center: dataset[id][0].cleanCoordinate,
      bearing: 27,
      zoom: 17,
      speed: 1,
      curve: 0.7,
      pitch: 45,
    });
  });

  return container;
}

function getCenter(info) {
  const initialCenter = [9.19, 45.4642];

  var chapters = {
    "first-section": {
      center: initialCenter,
      bearing: 27,
      zoom: 13,
      speed: 1,
      curve: 0.7,
      pitch: 45,
    },
    ...info,
  };

  window.onscroll = function () {
    var chapterNames = Object.keys(chapters);
    console.log(chapterNames);

    for (var i = 0; i < chapterNames.length; i++) {
      var chapterName = chapterNames[i];

      if (isElementOnScreen(chapterName)) {
        setActiveChapter(chapterName);
        break;
      }
    }
  };

  var activeChapterName = "first-section";
  $(`#${Object.keys(info)[0]}`).addClass("active");

  function setActiveChapter(chapterName) {
    if (chapterName === activeChapterName) return;
    console.log(chapterName);

    map.flyTo(chapters[chapterName]);

    document.getElementById(chapterName).setAttribute("class", "active");
    document.getElementById(activeChapterName).setAttribute("class", "");

    activeChapterName = chapterName;
  }

  function isElementOnScreen(id) {
    var element = document.getElementById(id);
    console.log(element);

    var bounds = element.getBoundingClientRect();

    return (
      bounds.top < window.innerHeight &&
      bounds.bottom > window.innerHeight - 400
    );
  }
}

function addMarkerVenue(coordinates) {
  const ids = Object.keys(coordinates);

  ids.forEach((id) => {
    var el = document.createElement("div");
    el.className = "marker";
    new mapboxgl.Marker(el).setLngLat(coordinates[id].center).addTo(map);
  });
}
