jQuery(function(){
	var dateBefore=null;
        
        
        
        jQuery(".datepick").datepicker({
		dateFormat: 'dd-mm-yy',
		showOn: 'focus',
		buttonImage: '../img/calendar/calendar.gif',
		buttonImageOnly: true,
		dayNamesMin: ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'], 
		monthNamesShort: ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'],
		changeMonth: true,
		changeYear: true ,
		beforeShow:function(){
				dateBefore=null;

			if(jQuery(this).val()!=""){
				var arrayDate=jQuery(this).val().split("-");		
				arrayDate[2]=parseInt(arrayDate[2])-543;
				jQuery(this).val(arrayDate[0]+"-"+arrayDate[1]+"-"+arrayDate[2]);
			}
			setTimeout(function(){
				$.each(jQuery(".ui-datepicker-year option"),function(j,k){
					var textYear=parseInt(jQuery(".ui-datepicker-year option").eq(j).val())+543;
					jQuery(".ui-datepicker-year option").eq(j).text(textYear);
				});				
			},50);
 
		},
		onChangeMonthYear: function(){
			setTimeout(function(){
				$.each(jQuery(".ui-datepicker-year option"),function(j,k){
					var textYear=parseInt(jQuery(".ui-datepicker-year option").eq(j).val())+543;
					jQuery(".ui-datepicker-year option").eq(j).text(textYear);
				});				
			},50);		
		},
		onClose:function(){
	
			if(dateBefore==null){	
			dateBefore= jQuery(this).val();
			}
		
			if(jQuery(this).val()!="" && jQuery(this).val()==dateBefore){			
				var arrayDate=dateBefore.split("-");
				arrayDate[2]=parseInt(arrayDate[2])+543;
				jQuery(this).val(arrayDate[0]+"-"+arrayDate[1]+"-"+arrayDate[2]);	
	
				}
				
		},
		onSelect: function(dateText, inst){ 
			dateBefore=jQuery(this).val();
			var arrayDate=dateText.split("-");
			arrayDate[2]=parseInt(arrayDate[2])+543;
			jQuery(this).val(arrayDate[0]+"-"+arrayDate[1]+"-"+arrayDate[2]);
		}
 
	});
        
        
        
        
	jQuery("#sdateInput").datepicker({
		dateFormat: 'dd-mm-yy',
		showOn: 'focus',
		buttonImage: '../img/calendar/calendar.gif',
		buttonImageOnly: true,
		dayNamesMin: ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'], 
		monthNamesShort: ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'],
		changeMonth: true,
		changeYear: true ,
		beforeShow:function(){
				dateBefore=null;

			if(jQuery(this).val()!=""){
				var arrayDate=jQuery(this).val().split("-");		
				arrayDate[2]=parseInt(arrayDate[2])-543;
				jQuery(this).val(arrayDate[0]+"-"+arrayDate[1]+"-"+arrayDate[2]);
			}
			setTimeout(function(){
				$.each(jQuery(".ui-datepicker-year option"),function(j,k){
					var textYear=parseInt(jQuery(".ui-datepicker-year option").eq(j).val())+543;
					jQuery(".ui-datepicker-year option").eq(j).text(textYear);
				});				
			},50);
 
		},
		onChangeMonthYear: function(){
			setTimeout(function(){
				$.each(jQuery(".ui-datepicker-year option"),function(j,k){
					var textYear=parseInt(jQuery(".ui-datepicker-year option").eq(j).val())+543;
					jQuery(".ui-datepicker-year option").eq(j).text(textYear);
				});				
			},50);		
		},
		onClose:function(){
	
			if(dateBefore==null){	
			dateBefore= jQuery(this).val();
			}
		
			if(jQuery(this).val()!="" && jQuery(this).val()==dateBefore){			
				var arrayDate=dateBefore.split("-");
				arrayDate[2]=parseInt(arrayDate[2])+543;
				jQuery(this).val(arrayDate[0]+"-"+arrayDate[1]+"-"+arrayDate[2]);	
	
				}
				
		},
		onSelect: function(dateText, inst){ 
			dateBefore=jQuery(this).val();
			var arrayDate=dateText.split("-");
			arrayDate[2]=parseInt(arrayDate[2])+543;
			jQuery(this).val(arrayDate[0]+"-"+arrayDate[1]+"-"+arrayDate[2]);
		}
 
	});
	
		jQuery("#edateInput").datepicker({
		dateFormat: 'dd-mm-yy',
		showOn: 'focus',
		buttonImage: '../img/calendar/calendar.gif',
		buttonImageOnly: true,
		dayNamesMin: ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'], 
		monthNamesShort: ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'],
		changeMonth: true,
		changeYear: true ,
		beforeShow:function(){
			dateBefore=null;
			if(jQuery(this).val()!=""){
				var arrayDate=jQuery(this).val().split("-");		
				arrayDate[2]=parseInt(arrayDate[2])-543;
				jQuery(this).val(arrayDate[0]+"-"+arrayDate[1]+"-"+arrayDate[2]);
			}
			setTimeout(function(){
				$.each(jQuery(".ui-datepicker-year option"),function(j,k){
					var textYear=parseInt(jQuery(".ui-datepicker-year option").eq(j).val())+543;
					jQuery(".ui-datepicker-year option").eq(j).text(textYear);
				});				
			},50);
 
		},
		onChangeMonthYear: function(){
			setTimeout(function(){
				$.each(jQuery(".ui-datepicker-year option"),function(j,k){
					var textYear=parseInt(jQuery(".ui-datepicker-year option").eq(j).val())+543;
					jQuery(".ui-datepicker-year option").eq(j).text(textYear);
				});				
			},50);		
		},
		onClose:function(){
			if(dateBefore==null){	
			dateBefore= jQuery(this).val();
			}
			
			if(jQuery(this).val()!="" && jQuery(this).val()==dateBefore){			
				var arrayDate=dateBefore.split("-");
				arrayDate[2]=parseInt(arrayDate[2])+543;
				jQuery(this).val(arrayDate[0]+"-"+arrayDate[1]+"-"+arrayDate[2]);	
			
			}
		},
		onSelect: function(dateText, inst){ 
			dateBefore=jQuery(this).val();
			var arrayDate=dateText.split("-");
			arrayDate[2]=parseInt(arrayDate[2])+543;
			jQuery(this).val(arrayDate[0]+"-"+arrayDate[1]+"-"+arrayDate[2]);
		}
 
	});
	

    jQuery("#cdateInput").datepicker({
        dateFormat: 'dd-mm-yy',
        showOn: 'focus',
        buttonImage: '../img/calendar/calendar.gif',
        buttonImageOnly: true,
        dayNamesMin: ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'],
        monthNamesShort: ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'],
        changeMonth: true,
        changeYear: true,
        beforeShow: function () {
            dateBefore = null;
            if (jQuery(this).val() != "") {
                var arrayDate = jQuery(this).val().split("-");
                arrayDate[2] = parseInt(arrayDate[2]) - 543;
                jQuery(this).val(arrayDate[0] + "-" + arrayDate[1] + "-" + arrayDate[2]);
            }
            setTimeout(function () {
                $.each(jQuery(".ui-datepicker-year option"), function (j, k) {
                    var textYear = parseInt(jQuery(".ui-datepicker-year option").eq(j).val()) + 543;
                    jQuery(".ui-datepicker-year option").eq(j).text(textYear);
                });
            }, 50);

        },
        onChangeMonthYear: function () {
            setTimeout(function () {
                $.each(jQuery(".ui-datepicker-year option"), function (j, k) {
                    var textYear = parseInt(jQuery(".ui-datepicker-year option").eq(j).val()) + 543;
                    jQuery(".ui-datepicker-year option").eq(j).text(textYear);
                });
            }, 50);
        },
        onClose: function () {
            if (dateBefore == null) {
                dateBefore = jQuery(this).val();
            }

            if (jQuery(this).val() != "" && jQuery(this).val() == dateBefore) {
                var arrayDate = dateBefore.split("-");
                arrayDate[2] = parseInt(arrayDate[2]) + 543;
                jQuery(this).val(arrayDate[0] + "-" + arrayDate[1] + "-" + arrayDate[2]);

            }
        },
        onSelect: function (dateText, inst) {
            dateBefore = jQuery(this).val();
            var arrayDate = dateText.split("-");
            arrayDate[2] = parseInt(arrayDate[2]) + 543;
            jQuery(this).val(arrayDate[0] + "-" + arrayDate[1] + "-" + arrayDate[2]);
        }

    });
    
    jQuery("#tsdateInput,#tedateInput").datepicker({
        dateFormat: 'dd-mm-yy',
        showOn: 'focus',
        buttonImage: '../img/calendar/calendar.gif',
        buttonImageOnly: true,
        dayNamesMin: ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'],
        monthNamesShort: ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'],
        changeMonth: true,
        changeYear: true,
        beforeShow: function () {
            dateBefore = null;
            if (jQuery(this).val() != "") {
                var arrayDate = jQuery(this).val().split("-");
                arrayDate[2] = parseInt(arrayDate[2]) - 543;
                jQuery(this).val(arrayDate[0] + "-" + arrayDate[1] + "-" + arrayDate[2]);
            }
            setTimeout(function () {
                $.each(jQuery(".ui-datepicker-year option"), function (j, k) {
                    var textYear = parseInt(jQuery(".ui-datepicker-year option").eq(j).val()) + 543;
                    jQuery(".ui-datepicker-year option").eq(j).text(textYear);
                });
            }, 50);

        },
        onChangeMonthYear: function () {
            setTimeout(function () {
                $.each(jQuery(".ui-datepicker-year option"), function (j, k) {
                    var textYear = parseInt(jQuery(".ui-datepicker-year option").eq(j).val()) + 543;
                    jQuery(".ui-datepicker-year option").eq(j).text(textYear);
                });
            }, 50);
        },
        onClose: function () {
            if (dateBefore == null) {
                dateBefore = jQuery(this).val();
            }

            if (jQuery(this).val() != "" && jQuery(this).val() == dateBefore) {
                var arrayDate = dateBefore.split("-");
                arrayDate[2] = parseInt(arrayDate[2]) + 543;
                jQuery(this).val(arrayDate[0] + "-" + arrayDate[1] + "-" + arrayDate[2]);

            }
        },
        onSelect: function (dateText, inst) {
            dateBefore = jQuery(this).val();
            var arrayDate = dateText.split("-");
            arrayDate[2] = parseInt(arrayDate[2]) + 543;
            jQuery(this).val(arrayDate[0] + "-" + arrayDate[1] + "-" + arrayDate[2]);
        }

    });
	

    jQuery("#expDateInput,#reportDateInput,#finalDateInput").datepicker({
        dateFormat: 'dd-mm-yy',
        showOn: 'focus',
        buttonImage: '../img/calendar/calendar.gif',
        buttonImageOnly: true,
        dayNamesMin: ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'],
        monthNamesShort: ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'],
        changeMonth: true,
        changeYear: true,
        beforeShow: function () {
            dateBefore = null;
            if (jQuery(this).val() != "") {
                var arrayDate = jQuery(this).val().split("-");
                arrayDate[2] = parseInt(arrayDate[2]) - 543;
                jQuery(this).val(arrayDate[0] + "-" + arrayDate[1] + "-" + arrayDate[2]);
            }
            setTimeout(function () {
                $.each(jQuery(".ui-datepicker-year option"), function (j, k) {
                    var textYear = parseInt(jQuery(".ui-datepicker-year option").eq(j).val()) + 543;
                    jQuery(".ui-datepicker-year option").eq(j).text(textYear);
                });
            }, 50);

        },
        onChangeMonthYear: function () {
            setTimeout(function () {
                $.each(jQuery(".ui-datepicker-year option"), function (j, k) {
                    var textYear = parseInt(jQuery(".ui-datepicker-year option").eq(j).val()) + 543;
                    jQuery(".ui-datepicker-year option").eq(j).text(textYear);
                });
            }, 50);
        },
        onClose: function () {
            if (dateBefore == null) {
                dateBefore = jQuery(this).val();
            }

            if (jQuery(this).val() != "" && jQuery(this).val() == dateBefore) {
                var arrayDate = dateBefore.split("-");
                arrayDate[2] = parseInt(arrayDate[2]) + 543;
                jQuery(this).val(arrayDate[0] + "-" + arrayDate[1] + "-" + arrayDate[2]);

            }
        },
        onSelect: function (dateText, inst) {
            dateBefore = jQuery(this).val();
            var arrayDate = dateText.split("-");
            arrayDate[2] = parseInt(arrayDate[2]) + 543;
            jQuery(this).val(arrayDate[0] + "-" + arrayDate[1] + "-" + arrayDate[2]);
        }

    });
	



});
