// select2
$(".select-control").select2({
 minimumResultsForSearch: -1,
 placeholder: function () {
  $(this).data("placeholder");
 },
});
$(".select-control.has-search").select2({
 placeholder: "Select",
});

$(".select-checkbox").select2({
 closeOnSelect: false,
 // placeholder : "Placeholder",
 // allowHtml: true,
 // allowClear: true,
 tags: true, // создает новые опции на лету
 dropdownCssClass: "style-column-checkbox",
});

// var $elSelect2Checkbox = $(".select-checkbox").select2({
//  closeOnSelect: false,
//  tags: true,
// });

// $elSelect2Checkbox
//  .data("select2")
//  .$container.addClass("style-column-checkbox");


$(document).ready(function() {

    jQuery(function() {
        var classFontSize = new Array();
        var txtFontSize = new Array();
        var nameClassFont = new Array();

        nameClassFont.push('p');
        nameClassFont.push('a');
         nameClassFont.push('strong');
        nameClassFont.push('span');
        nameClassFont.push('h1');
        nameClassFont.push('h2');
        nameClassFont.push('h3');
        nameClassFont.push('.sc-map .head .title:not(strong)');
        nameClassFont.push('.sc-map .head .title:not(span)');
        



        for (var i = 0; i < nameClassFont.length; i++) {
            classFontSize.push(nameClassFont[i]);
            txtFontSize.push(parseInt($(nameClassFont[i]).css('font-size')));
        }

        $('a.size-small').click(function() {
            for (var i = 0; i < classFontSize.length; i++) {
                $(classFontSize[i]).css("font-size", txtFontSize[i] + "px");
            }
            $(this).addClass('active');
            $('a.size-medium').removeClass('active');
            $('a.size-large').removeClass('active');

            $('body').removeClass('size-medium-style');
            $('body').removeClass('size-large-style');
            $('body').addClass('size-small-style');

            $('.overflow-line-1').trunk8({
                lines: 1,
                tooltip: false
            });
            $('.overflow-line-2').trunk8({
                lines: 2,
                tooltip: false
            });
            $('.overflow-line-3').trunk8({
                lines: 3,
                tooltip: false
            });
            $('.overflow-line-4').trunk8({
                lines: 4,
                tooltip: false
            });
        });

        $('a.size-medium').click(function() {
            for (var i = 0; i < classFontSize.length; i++) {
                $(classFontSize[i]).css("font-size", (txtFontSize[i] + parseInt(1)) + "px");
            }
            $(this).addClass('active');
            $('a.size-small').removeClass('active');
            $('a.size-large').removeClass('active');

            $('body').removeClass('size-small-style');
            $('body').removeClass('size-large-style');
            $('body').addClass('size-medium-style');

            $('.overflow-line-1').trunk8({
                lines: 1,
                tooltip: false
            });
            $('.overflow-line-2').trunk8({
                lines: 2,
                tooltip: false
            });
            $('.overflow-line-3').trunk8({
                lines: 3,
                tooltip: false
            });
            $('.overflow-line-4').trunk8({
                lines: 4,
                tooltip: false
            });
        });

        $('a.size-large').click(function() {
            for (var i = 0; i < classFontSize.length; i++) {
                $(classFontSize[i]).css("font-size", (txtFontSize[i] + parseInt(2)) + "px");
            }
            $(this).addClass('active');
            $('a.size-small').removeClass('active');
            $('a.size-medium').removeClass('active');

            $('body').removeClass('size-small-style');
            $('body').removeClass('size-medium-style');
            $('body').addClass('size-large-style');

            $('.overflow-line-1').trunk8({
                lines: 1,
                tooltip: false
            });
            $('.overflow-line-2').trunk8({
                lines: 2,
                tooltip: false
            });
            $('.overflow-line-3').trunk8({
                lines: 3,
                tooltip: false
            });
            $('.overflow-line-4').trunk8({
                lines: 4,
                tooltip: false
            });
        });
    });

});