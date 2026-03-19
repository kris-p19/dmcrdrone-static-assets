$('[data-toggle="datepicker"]').on('apply.daterangepicker', function(ev, picker) {
    $(this).val(picker.startDate.format('DD/MM/Y') + ' - ' + picker.endDate.format('DD/MM/Y'));
});

$('[data-toggle="datepicker"]').on('cancel.daterangepicker', function(ev, picker) {
    $(this).val('');
});


$('[data-toggle="datepicker"]').daterangepicker({
    "showDropdowns": true,
    autoUpdateInput: false,
    autoApply: true,
    locale: {
        cancelLabel: 'Clear',
        "applyLabel": "เลือก",
        "cancelLabel": "ล้าง",
        "format": 'DD/MM/Y',
        "daysOfWeek": [
            "อา",
            "จ",
            "อ",
            "พ",
            "พฤ",
            "ศ",
            "ส"
        ],
        "monthNames": [
            "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
        ],
    }
});


$('[data-toggle="datepicker-sg"]').daterangepicker({
    "showDropdowns": true,
    singleDatePicker: true,
    locale: {
        cancelLabel: 'Clear',
        "applyLabel": "เลือก",
        "cancelLabel": "ล้าง",
        "format": 'DD/MM/Y',
        "daysOfWeek": [
            "อา",
            "จ",
            "อ",
            "พ",
            "พฤ",
            "ศ",
            "ส"
        ],
        "monthNames": [
            "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
        ],
    }
});