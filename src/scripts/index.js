import '../styles/index.scss';
import 'bootstrap';
import $ from 'jquery';
import Navigo from 'navigo';

var root = null;
var useHash = true;
var router = new Navigo(root, useHash);

const tmplItem = (item) => {
    return `<div class="row"><div class="search-list-item w-100">
        <div class="row">
            <div class="col-lg-12"> 
                <img src="${item.poster}" height="250" class="float-left" />
                <div class="float-left ml-3">
                    <div>${item.title}</div>
                    <div><b>Yıl:</b> ${item.year}</div>
                    <div><b>Tür:</b> ${item.type}</div>
                    <div> <a href="https://www.imdb.com/title/${item.imdbID}" target="_blank">Detayına Git</a> </div>
                </div>
            </div>
        </div>
    </div></div>`;
};


const omdbApiKey = "43998bec";

$(function () {
    var $searchField = $('#search-field');
    var $searchResultContainer = $('#search-result-container');

    $searchField.on('keyup', (e) => {
        const { value } = e.target;

        if (value.length > 2) {
            getDataFromAPI(value);
        } else {
            $searchResultContainer.hide();
        }
    });


    $(window).scroll(function () {
        if ($(this).scrollTop() > 100) {
            $('#scrollup').fadeIn();
        } else {
            $('#scrollup').fadeOut();
        }
    });

    $('#scrollup').click(() => {
        $("html, body").animate({ scrollTop: 0 }, 400);
        return false;
    });



    router
        .on('/arama/:query', (params) => {
            $searchField.val(params.query);
            getDataFromAPI(params.query);

        })
        .resolve();

    function getDataFromAPI(value) {
        var request = new Request('https://www.omdbapi.com/?apikey=' + omdbApiKey + '&s=' + value);

        fetch(request)
            .then(result => result.json())
            .then(data => {
                if (!data.Search) {
                    return;
                }

                const items = data.Search.map(item => ({
                    title: item.Title,
                    year: item.Year,
                    poster: item.Poster,
                    type: item.Type,
                    imdbID: item.imdbID
                }));

                if (items.length) {
                    $searchResultContainer.html(`
                        <div class="row">
                            <div class="col-lg-12">
                                ${tmplItem(items[0])}
                            </div>
                            <div class="col-lg-12">
                                ${tmplItem(items[1])}
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-lg-12 text-center">
                                <button class="btn btn-success mt-2 mb-2" 
                                        id="more-result-btn">Daha Fazla Sonuç</button>
                            </div>
                        </div>
                    `);

                    $("#more-result-btn").click(() => {
                        $searchResultContainer.hide();

                        const itemTemplates = items.map((item) => {
                            return `<div class="col-lg-6 col-sm-6">${tmplItem(item)}` + "</div>";
                        });


                        $('#more-result-container').html(`
                        <div class="row">
                          ${itemTemplates.join('')}
                        </div>
                    `);

                        router.pause();
                        router.navigate('/arama/' + value);

                        setTimeout(() => {
                            router.resume();
                        });

                    });

                    $searchResultContainer.show();

                }
            });

    }


});




