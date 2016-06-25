$(function () {
    var $query = $('#inputQuery');
    var $url = $('#inputUrl');
    var $form = $('form');
    var $loading = $('#loading');
    var $raw = $('#raw');
    var $res = $('#res');

    $form.on('submit', function (e) {
        e.preventDefault();
        $loading.show();

        $raw.empty();
        $res.empty();

        $.ajax({
            url: '/info',
            method: 'post',
            dataType: 'json',
            data: {
                query: $query.val(),
                url: $url.val()
            }
        })
            .done(function (res) {
                $loading.hide();

                var links = res.page_links.reduce(function(a, b) {
                    return a.concat(b);
                }, []);

                if (res.position !== -1) {
                    $res.html('Позиция: <span class="label label-success">' + res.position + '</span><br>');
                } else {
                    $res.html('Позиция: <span class="label label-danger">не найдено</span><br>');
                }
                $res.append('Просмотрено страниц: <span class="label label-info">' + links.length / 10 + '</span><br>');
                $res.append('Время выполнения: <span class="label label-warning">' + res.time / 1000 + 'сек</span><br><br>');

                if(res.screenshots.length) {
                    var screens = '';
                    res.screenshots.forEach(function(screen) {
                        screen = screen.replace('static/','');
                        screens += '<a href="'+screen+'" data-lightbox="'+screen+'"><img class="thumb" src="'+screen+'"></a>';
                    });
                }

                $res.append('Скриншоты страниц: <br>'+screens+'<br>');

                $raw.text(JSON.stringify(res, null, 2));
            });

        return false;
    })
});