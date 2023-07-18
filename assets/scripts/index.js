const cloneElement = (originalElement, newChildren) => {
    const clonedElement = document.createElement(originalElement.tagName);

    // Copy over the attributes
    for (let i = 0; i < originalElement.attributes.length; i++) {
        const attribute = originalElement.attributes[i];
        clonedElement.setAttribute(attribute.name, attribute.value);
    }

    // Copy over the children
    if (originalElement.children.length > 0) {
        for (let i = 0; i < originalElement.children.length; i++) {
            const child = originalElement.children[i].cloneNode(true);
            clonedElement.appendChild(child);
        }
    }

    // Append new children
    if (newChildren) {
        if (Array.isArray(newChildren)) {
            newChildren.forEach(child => {
                clonedElement.appendChild(child);
            });
        } else {
            clonedElement.appendChild(newChildren);
        }
    }

    return clonedElement;
}

const checkTargetOrKey = event => {
    if (
        event.target.classList.contains('popup__wrapper') ||
        event.key === 'Escape' ||
        event.target.closest('.popup-close')
    ) {
        hideAllPopups();
    }
};

const showPopup = popupId => {
    const popup = document.querySelector(popupId);
    if (!popup) return

    const pageWrapper = document.querySelector('.page-wrapper');

    hideAllPopups();

    popup.classList.add('popup--active');
    pageWrapper.classList.add('no-scroll');

    document.addEventListener('click', checkTargetOrKey);
    document.addEventListener('keyup', checkTargetOrKey);
};

const hideAllPopups = () => {
    const popups = document.querySelectorAll('.popup'),
        pageWrapper = document.querySelector('.page-wrapper');

    popups.forEach(popup => {
        popup.classList.remove('popup--active');
    });
    pageWrapper.classList.remove('no-scroll');

    document.removeEventListener('click', checkTargetOrKey);
    document.removeEventListener('keyup', checkTargetOrKey);
};

const updatePopupHeight = (element) => {
    const popupContent = element.querySelector('.popup__content');
    const elementHeight = popupContent.offsetHeight;
    element.style.setProperty('--element-height', `${elementHeight}px`);
}


// select functions
const selectInit = () => {
    const selectArray = document.querySelectorAll('.custom-select');

    if (selectArray.length > 0) {
        selectArray.forEach((element, index) => {
            const selectTag = element.querySelector('select'),
                selectOption = selectTag.querySelectorAll('option');

            const selectWrapper = document.createElement('div'),
                selectLabel = document.createElement('div'),
                selectItemList = document.createElement('div'),
                selectLabelSpan = document.createElement('span');

            selectWrapper.classList.add('select__wrapper');

            selectLabel.classList.add('select__label');
            selectLabelSpan.classList.add('select__name');

            selectLabelSpan.textContent = selectTag[selectTag.selectedIndex].textContent;
            selectLabel.append(selectLabelSpan);

            selectItemList.classList.add('select__content', 'select__content--hidden')

            selectWrapper.append(selectLabel);
            element.append(selectWrapper);

            selectOption.forEach((element, index) => {
                const selectItem = document.createElement('div');

                selectItem.classList.add('select__item');
                selectItem.textContent = element.textContent;

                selectItem.addEventListener('click', (e) => {
                    const selectItemTag = e.target.closest('.select').querySelector('select'),
                        selectItemOptions = selectItemTag.querySelectorAll('option');

                    selectItemOptions.forEach((element, index) => {
                        if (element.textContent === selectItem.textContent) {
                            selectItemTag.selectedIndex = index;
                            selectLabelSpan.textContent = element.textContent;

                            // Trigger change event when selectIndex is changed
                            const event = new Event('change');
                            selectItemTag.dispatchEvent(event);
                        }
                    });

                    selectLabel.click();
                });
                selectItemList.append(selectItem);
            });
            selectWrapper.append(selectItemList);

            selectLabel.addEventListener('click', (e) => {
                e.stopPropagation();

                closeAllSelect(selectLabel);
                window.innerHeight - selectItemList.getBoundingClientRect().bottom < 100 ? (selectItemList.classList.add('select__content--top'), selectLabel.classList.add('select__label--top')) : (selectItemList.classList.remove('select__content--top'), selectLabel.classList.remove('select__label--top'))

                selectItemList.classList.toggle('select__content--hidden');
                selectLabel.classList.toggle('select__label--active');
            });

            selectTag.addEventListener('change', () => {
                const selectItemOptions = selectTag.options,
                    selectedItem = selectItemOptions[selectTag.selectedIndex];

                selectLabelSpan.textContent = selectedItem.textContent;
            })
        });

        document.addEventListener('click', closeAllSelect);
    }
}

const closeAllSelect = (select) => {
    const selectContentArray = document.querySelectorAll('.select__content'),
        selectLabelArray = document.querySelectorAll('.select__label');

    selectLabelArray.forEach((element, index) => {
        element !== select ? (element.classList.remove('select__label--active'), selectContentArray[index].classList.add('select__content--hidden')) : null;
    });
}


const toggleFilterBlock = (inputArray, link, limit) => {
    link.classList.toggle('filter-block__link--active');
    if (link.classList.contains('filter-block__link--active')) {
        inputArray.forEach(element => element.classList.remove('filter-block__item--hidden'));
        link.textContent = 'Свернуть';
    } else {
        link.textContent = 'Смотреть еще';
        inputArray.forEach((filterBlockInputElement, filterBlockInputIndex) => {
            filterBlockInputIndex >= limit ? filterBlockInputElement.classList.add('filter-block__item--hidden') : filterBlockInputElement.classList.remove('filter-block__item--hidden');
        });
    }
}

// map Init function

async function initMap(element, elementCoord) {
    const coord = elementCoord.split(',');
    const position = {lat: +coord[0], lng: +coord[1]};

    //@ts-ignore
    const {Map} = await google.maps.importLibrary("maps");
    const {Marker} = await google.maps.importLibrary("marker");

    // custom marker
    const markerIcon = {
        url: '/assets/images/icons/pin-white.svg',
        size: new google.maps.Size(50, 50),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(25, 50)
    };

    let map = new Map(element, {
        zoom: 12,
        center: position,
        disableDefaultUI: true,
        zoomControl: true,
        scrollwheel: false,
        // custom styles for map
        styles: [
            {
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#212121"
                    }
                ]
            },
            {
                "elementType": "labels.icon",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#757575"
                    }
                ]
            },
            {
                "elementType": "labels.text.stroke",
                "stylers": [
                    {
                        "color": "#212121"
                    }
                ]
            },
            {
                "featureType": "administrative",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#757575"
                    }
                ]
            },
            {
                "featureType": "administrative.country",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#9e9e9e"
                    }
                ]
            },
            {
                "featureType": "administrative.land_parcel",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "administrative.locality",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#bdbdbd"
                    }
                ]
            },
            {
                "featureType": "poi",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#757575"
                    }
                ]
            },
            {
                "featureType": "poi.park",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#181818"
                    }
                ]
            },
            {
                "featureType": "poi.park",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#616161"
                    }
                ]
            },
            {
                "featureType": "poi.park",
                "elementType": "labels.text.stroke",
                "stylers": [
                    {
                        "color": "#1b1b1b"
                    }
                ]
            },
            {
                "featureType": "road",
                "elementType": "geometry.fill",
                "stylers": [
                    {
                        "color": "#2c2c2c"
                    }
                ]
            },
            {
                "featureType": "road",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#8a8a8a"
                    }
                ]
            },
            {
                "featureType": "road.arterial",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#373737"
                    }
                ]
            },
            {
                "featureType": "road.highway",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#3c3c3c"
                    }
                ]
            },
            {
                "featureType": "road.highway.controlled_access",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#4e4e4e"
                    }
                ]
            },
            {
                "featureType": "road.local",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#616161"
                    }
                ]
            },
            {
                "featureType": "transit",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#757575"
                    }
                ]
            },
            {
                "featureType": "water",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#000000"
                    }
                ]
            },
            {
                "featureType": "water",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#3d3d3d"
                    }
                ]
            }
        ]
    });

    new google.maps.Marker({
        position: position,
        map: map,
        icon: markerIcon,
    });
}


document.addEventListener('DOMContentLoaded', () => {
    const phoneInputs = document.querySelectorAll('input[type="tel"]');

    if (phoneInputs.length) {
        phoneInputs.forEach((input) => {
            var iti = window.intlTelInput(input, {
                nationalMode: true,
                initialCountry: 'auto',
                geoIpLookup: function (callback) {
                    $.get('https://ipinfo.io', function () {
                    }, 'jsonp').always(function (resp) {
                        var countryCode = resp && resp.country ? resp.country : 'us';
                        callback(countryCode);
                    });
                },
                utilsScript: '/assets/libs/intl-tel/utils.js',
                preferredCountries: ['ru', 'ua', 'kz'],
            });
            var handleChange = function () {
                var text = iti.isValidNumber() ? iti.getNumber() : '';
                iti.setNumber(text);
                input.value = text;
            };
            input.addEventListener('mouseleave', handleChange);
            input.addEventListener('change', handleChange);
        });
    }

    const sliderHero = new Swiper('.hero-slider', {
        loop: true,
        speed: 1000,

        // If we need pagination
        pagination: {
            el: '.slider__navigation',
            clickable: true,
        },
        autoplay: {
            delay: 5000,
        },

        // Navigation arrows
        navigation: {
            nextEl: '.slider__button--next',
            prevEl: '.slider__button--prev',
        },
    });

    const sliderSingle = new Swiper('.slider--single', {
        speed: 1000,
        spaceBetween: 20,

        // If we need pagination
        pagination: {
            el: '.slider__navigation',
            clickable: true,
        },

        // Navigation arrows
        navigation: {
            nextEl: '.slider__button--next',
            prevEl: '.slider__button--prev',
        },
    });


    const sliderThreeColumn = new Swiper('.slider--column--three', {
        speed: 1000,
        slidesPerView: 3,
        spaceBetween: 20,

        breakpoints: {
            900: {
                slidesPerView: 2,
            },
            600: {
                slidesPerView: 1,
            }
        },

        // If we need pagination
        pagination: {
            el: '.slider__navigation',
            clickable: true,
        },

        // Navigation arrows
        navigation: {
            nextEl: '.slider__button--next',
            prevEl: '.slider__button--prev',
        },
    });

    const sliderFourthColumn = new Swiper('.slider--column--fourth', {
        speed: 1000,
        slidesPerView: 4,
        spaceBetween: 20,

        breakpoints: {
            1200: {
                slidesPerView: 3,
            },
            900: {
                slidesPerView: 2,
            },
            600: {
                slidesPerView: 1,
            }
        },

        // If we need pagination
        pagination: {
            el: '.slider__navigation',
            clickable: true,
        },

        // Navigation arrows
        navigation: {
            nextEl: '.slider__button--next',
            prevEl: '.slider__button--prev',
        },
    });

    const sliderPartners = new Swiper('.partners-slider', {
        centeredSlides: true,
        speed: 5000,
        autoplay: {
            delay: 1,
            reverseDirection: true
        },
        loop: true,
        loopedSlides: 3,
        slidesPerView: 'auto',
        allowTouchMove: false,
        disableOnInteraction: true,
        spaceBetween: 120,
        breakpoints: {
            600: {
                spaceBetween: 35,
            }
        }
    });

    const popupButtons = document.querySelectorAll('[data-popup]');
    const popups = document.querySelectorAll('.popup');

    if (popups.length > 0) {
        popups.forEach(element => {
            window.addEventListener('resize', () => updatePopupHeight(element));
            updatePopupHeight(element);
        });
        popupButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();

                const popupId = button.dataset.popup
                showPopup(popupId);
            });
        });
    }

    const buttonTop = document.querySelector('.button-top');
    if (buttonTop) {
        const pageWrapper = document.querySelector('.page-wrapper');
        buttonTop.addEventListener('click', (e) => {
            e.preventDefault();
            pageWrapper.scrollTo({top: 0, behavior: 'smooth'});
        });
    }

    const contact = document.querySelectorAll('.contact');

    if (contact.length) {
        contact.forEach(element => {
            const contactForm = element.querySelector('.form'),
                contactContent = element.querySelector('.contact__content'),
                contactTitle = element.querySelector('.contact__title'),
                contactText = element.querySelector('.contact__text'),
                contactWrapper = element.querySelector('.contact-wrapper');

            if (!contactWrapper) return false;

            const contactWrapperHeight = contactWrapper.getBoundingClientRect().height;

            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();

                contactTitle.innerHTML = 'Спасиб<span class="letter letter--star letter--star--white">о</span> за заявку';
                contactText.textContent = 'В скором времени наш менеджер свяжется с вами!';

                contactContent.classList.add('contact__content--hidden');
                contactWrapper.classList.add('contact__wrapper--result');
                contactWrapper.style.height = `${contactWrapperHeight}px`;
            });
        });
    }

    selectInit();


    // burger settings
    const burger = document.querySelector('.burger');

    if (burger) {
        const nav = document.querySelector('.nav'),
            pageWrapper = document.querySelector('.page-wrapper');
        burger.addEventListener('click', (e) => {
            e.preventDefault();

            burger.classList.toggle('burger--active')
            nav.classList.toggle('nav--active');
            pageWrapper.classList.toggle('no-scroll');
        });
    }

    //filter settings
    const filter = document.querySelector('.filter');

    if (filter) {
        const limitInput = 5;
        const filterBlockArray = filter.querySelectorAll('.filter-block');

        //filter reset settings

        const filterReset = filter.querySelectorAll('.filter-reset');
        if (filterReset.length) {
            filterReset.forEach(element => {
                element.addEventListener('click', (e) => {
                    e.preventDefault();
                    filter.reset();
                });
            })
        }

        //filter all settings

        const filterAllCheckbox = filter.querySelectorAll('[value="all"]');

        if (filterAllCheckbox.length) {
            filterAllCheckbox.forEach(checkbox => {
                const filterBlock = checkbox.closest('.filter-block'),
                    filterBlockInput = filterBlock.querySelectorAll('[type="checkbox"]');
                checkbox.addEventListener('change', () => {
                    filterBlockInput.forEach(input => {
                        input.checked = checkbox.checked;
                    });
                });
                filterBlockInput.forEach(element => {
                    element.addEventListener('change', () => {
                        if (element.checked === false) {
                            checkbox.checked = false;
                        }
                    });
                })
            });
        }

        // filter block settings

        filterBlockArray.forEach(filterBlock => {
            const filterBlockContent = filterBlock.querySelector('.filter-block__content'),
                filterBlockInputArray = filterBlockContent.querySelectorAll('.filter-block__item');

            // add link to the block
            if (filterBlockInputArray.length > limitInput) {
                const filterBlockFooter = document.createElement('div')
                filterBlockFooter.classList.add('.filter-block__footer');

                const link = document.createElement('a');
                link.href = '#';
                link.classList.add('text', 'text--middle', 'text--yellow', 'text--medium', 'filter-block__link', 'filter-block__link--active');

                link.addEventListener('click', () => toggleFilterBlock(filterBlockInputArray, link, limitInput));

                filterBlockFooter.append(link);
                filterBlock.append(filterBlockFooter)

                toggleFilterBlock(filterBlockInputArray, link, limitInput);
            }

        });

        //filter burger settings
        const filterBurger = document.querySelector('.filter-burger');

        filterBurger.addEventListener('click', (e) => {
            filterBurger.classList.toggle('filter-burger--active');
            filter.classList.toggle('filter--active')
        });

    }

    //popup Gallery

    const popupGalleryWrapper = document.querySelectorAll('.popup-gallery-wrapper'),
        popupGallery = document.querySelector('.popup-gallery');
    if (popupGalleryWrapper.length && popupGallery) {
        const gallerySlider = new Swiper('.popup-gallery__slider', {
            speed: 1000,
            spaceBetween: 20,

            // If we need pagination
            pagination: {
                el: '.slider__navigation',
                clickable: true,
            },

            // Navigation arrows
            navigation: {
                nextEl: '.slider__button--next',
                prevEl: '.slider__button--prev',
            },
        });
        popupGalleryWrapper.forEach(element => {
            const popupImg = element.querySelectorAll('img');
            const popupGalleryWrapper = popupGallery.querySelector('.popup__content');
            const popupGalleryContent = document.querySelector('.popup-gallery__content');
            if (element.classList.contains('popup-gallery-wrapper--big')) {
                popupGalleryWrapper.classList.add('popup__content--big')
            } else {
                popupGalleryWrapper.classList.remove('popup__content--big')
            }
            popupImg.forEach((img, imgIndex) => {
                img.addEventListener('click', (e) => {
                    e.preventDefault();

                    popupGalleryContent.innerHTML = '';

                    popupImg.forEach(newImg => {
                        const newSlide = document.createElement('div');
                        newSlide.classList.add('swiper-slide');
                        const cloneImg = newImg.cloneNode();

                        newSlide.append(cloneImg);
                        popupGalleryContent.append(newSlide);
                    });

                    gallerySlider.update();
                    gallerySlider.slideTo(imgIndex)

                    showPopup('.popup-gallery');
                });
            });
        });
    }

    //popup Plans
    const plansWrapperArray = document.querySelectorAll('.plans');

    if (plansWrapperArray.length) {
        plansWrapperArray.forEach(plansWrapper => {
            const plansItemArray = plansWrapper.querySelectorAll('.product');

            if (plansItemArray.length) {
                const plansItemPopup = document.querySelector('.popup__content--plans');
                if (!plansItemPopup) return false;
                plansItemArray.forEach(element => {
                    element.addEventListener('click', (e) => {
                        e.preventDefault();
                        plansItemPopup.innerHTML = '';

                        const newElement = cloneElement(element);
                        newElement.classList.remove('swiper-slide');
                        newElement.classList.add('product--row');

                        const newElementContent = newElement.querySelector('.product__content');
                        const button = document.createElement('a');
                        button.classList.add('button', 'button--yellow', 'button--base');
                        button.addEventListener('click', () => showPopup('.popup-contact'))
                        button.textContent = 'Отправить заявку';

                        newElementContent.append(button);

                        plansItemPopup.append(newElement);
                        showPopup('.popup-plans');
                    });
                });
            }
        });
    }


    const mapArray = document.querySelectorAll('.map');

    if (mapArray.length) {
        mapArray.forEach(element => {
            const mapFrame = element.querySelector('.map-frame'),
                mapCoord = mapFrame.dataset.coord;

            if (!mapCoord) return

            initMap(mapFrame, mapFrame.dataset.coord);
        });
    }

    const languageChangeArray = document.querySelectorAll('.language-change');

    if (languageChangeArray.length) {
        languageChangeArray.forEach(select => {
            const url = window.location.href;
            const selectOption = [...select.options];

            selectOption.forEach((option, optionIndex) => {
                const optionUrl = option.dataset.url;
                if (optionUrl === url) {
                    select.selectedIndex = optionIndex;
                    select.dispatchEvent(new Event('change')); // Trigger change event
                }
            });

            select.addEventListener('change', (e) => {
                const selectedOption = selectOption[select.selectedIndex],
                selectedUrl = selectedOption.dataset.url;

                if(selectedUrl !== url){
                    window.location.href = selectedUrl;
                }
            });
        });
    }
});