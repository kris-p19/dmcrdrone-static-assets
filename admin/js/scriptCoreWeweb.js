// JavaScript Document
// ####################################### Start Setting ################################################# //

function Paging_CheckAll(objCheckHeader, txtCheckBoxFirstName, intTotalItems) {
    if (intTotalItems > 0)
        for (i = 1; i <= intTotalItems; i++)
            document.getElementById(txtCheckBoxFirstName + i).checked = objCheckHeader.checked;
    return true;
}



function Paging_CheckAllHandle(objCheckHeader, txtCheckBoxFirstName, intTotalItems) {
    var isCheckedAll = true;
    if (intTotalItems > 0)
        for (i = 1; i <= intTotalItems; i++)
            if (!document.getElementById(txtCheckBoxFirstName + i).checked)
                isCheckedAll = false;
    objCheckHeader.checked = isCheckedAll;
    return true;
}

function Paging_CountChecked(txtCheckBoxFirstName, intTotalItems) {
    var intChecked = 0;
    if (intTotalItems > 0)
        for (i = 1; i <= intTotalItems; i++)
            if (document.getElementById(txtCheckBoxFirstName + i).checked)
                intChecked++;
    return intChecked;
}

function Paging_CheckedThisItem(objCheckHeader, indexing, txtCheckBoxFirstName, intTotalItems) {
    if (intTotalItems > 0)
        for (i = 1; i <= intTotalItems; i++)
            if (i == indexing) {
                document.getElementById(txtCheckBoxFirstName + i).checked = true;
            } else {
                document.getElementById(txtCheckBoxFirstName + i).checked = false;
            }
    objCheckHeader.checked = false;
    return true;
}



function popup(pname, purl, w, h, s) {
    LeftPosition = (screen.width) ? (screen.width - w - 8) / 2 : 0;
    TopPosition = (screen.height) ? (screen.height - h - 50) / 2 : 0;
    myWinName = window.open(purl, pname, "width=" + w + ",height=" + h + ",top=" + TopPosition + ",left=" + LeftPosition + ",resizable=yes,scrollbars=" + s);
    if (parseInt(navigator.appVersion) >= 4) {
        myWinName.window.focus();
    }
    return myWinName;
}

function setImageSelected(myPath) {
    window.opener.document.LibraryIconSample.src = myPath;
    window.opener.document.myForm.inputIconName.value = myPath;
    window.close();
}

function isBlank(myObj) {
    if (myObj.value == '') {
        return true;
    }
    return false;
}

function isNumber(myObj) {
    return !isNaN(myObj.value * 1)
}

// ####################################### End Setting ################################################# //
// ####################################### Start Login ################################################# //

function checkLoginUser() {

    jQuery.blockUI({
        message: jQuery('#tallContent'),
        css: {
            border: 'none',
            padding: '35px',
            backgroundColor: '#000',
            '-webkit-border-radius': '10px',
            '-moz-border-radius': '10px',
            opacity: .9,
            color: '#fff'
        }
    });

    var TYPE = "POST";
    var URL = "core/login.php";

    var dataSet = jQuery("#myFormLogin").serialize();
    jQuery.ajax({
        type: TYPE,
        url: URL,
        data: dataSet,
        success: function (html) {
            jQuery("#loadCheckComplete").show();
            jQuery("#loadCheckComplete").html(html);
            setTimeout(jQuery.unblockUI, 200);
        }
    });
}

function checkLogoutUser() {
    jQuery.blockUI({
        message: jQuery('#tallContent'),
        css: {
            border: 'none',
            padding: '35px',
            backgroundColor: '#000',
            '-webkit-border-radius': '10px',
            '-moz-border-radius': '10px',
            opacity: .9,
            color: '#fff'
        }

    });

    var TYPE = "POST";
    var URL = "../core/logout.php";
    var dataSet = {};
    jQuery.ajax({
        type: TYPE,
        url: URL,
        data: dataSet,
        success: function (html) {
            jQuery("#loadCheckComplete").show();
            jQuery("#loadCheckComplete").html(html);
            setTimeout(jQuery.unblockUI, 200);
        }
    });
}


// ####################################### End Login ################################################# //
// ####################################### Start Top Menu ################################################# //
function clickInSubMenuTop() {
    var divSubMenu = jQuery("#divSubMenuTop");
    divSubMenu.show();
    divSubMenu.animate({ height: '40px' }, 400);
    jQuery('#showSubMenuTop').attr('onclick', 'clickOutSubMenuTop()');

}

function clickOutSubMenuTop() {
    var divSubMenu = jQuery("#divSubMenuTop");
    divSubMenu.animate({ height: '0px' }, 400);
    divSubMenu.hide(0);
    jQuery('#showSubMenuTop').attr('onclick', 'clickInSubMenuTop()');

}
// ####################################### End Top Menu ################################################# //
// ####################################### Start Left Menu ################################################# //
function clickInSubMenuLeft(boxMenu, boxMenuLeft, valHeight) {
    var divSubMenuL = jQuery("#" + boxMenuLeft);
    divSubMenuL.show();
    divSubMenuL.animate({ height: valHeight + 'px' }, 500);
    jQuery("#" + boxMenu).attr("onclick", "clickOutSubMenuLeft('" + boxMenu + "','" + boxMenuLeft + "','" + valHeight + "')");

}

function clickOutSubMenuLeft(boxMenu, boxMenuLeft, valHeight) {
    var divSubMenuL = jQuery("#" + boxMenuLeft);
    divSubMenuL.animate({ height: '0px' }, 500);
    divSubMenuL.hide(0);
    jQuery("#" + boxMenu).attr("onclick", "clickInSubMenuLeft('" + boxMenu + "','" + boxMenuLeft + "','" + valHeight + "')");


}
// ####################################### End Left Menu ################################################# //
// ####################################### Start Home ################################################# //

function boxContantLoad(fileAc) {
    jQuery("#boxWaittingContant").show();

    var TYPE = "POST";
    var URL = fileAc;

    var dataSet = jQuery("#myFormHome").serialize();
    jQuery.ajax({
        type: TYPE,
        url: URL,
        data: dataSet,
        success: function (html) {
            jQuery("#boxContantLoad").show();
            jQuery("#boxContantLoad").html(html);
            jQuery("#boxWaittingContant").hide();
        }
    });
}


function addContactNew(fileAc) {
    document.myFormHome.action = fileAc;
    document.myFormHome.submit();
}

function editContactNew(fileAc, id) {
    document.myFormHome.action = fileAc;
    document.myFormHome.submit();
}

function sortContactNew(fileAc) {
    document.myFormHome.action = fileAc;
    document.myFormHome.submit();
}


function insertContactNew(fileAc) {

    jQuery.blockUI({
        message: jQuery('#tallContent'),
        css: {
            border: 'none',
            padding: '35px',
            backgroundColor: '#000',
            '-webkit-border-radius': '10px',
            '-moz-border-radius': '10px',
            opacity: .9,
            color: '#fff'
        }
    });


    var TYPE = "POST";
    var URL = fileAc;

    var dataSet = jQuery("#myForm").serialize();

    jQuery.ajax({
        type: TYPE,
        url: URL,
        data: dataSet,
        success: function (html) {
            jQuery("#loadCheckComplete").show();
            jQuery("#loadCheckComplete").html(html);
            setTimeout(jQuery.unblockUI, 200);

        }
    });
}



function loadDownloadSelectMl(gID, masterkey, tID) {
    //alert('test');
    jQuery("#loadWaitingCategory").show();

    var TYPE = "POST";
    var URL = "../mod_downloadml/load_selectType.php";
    var dataSet = {
        gID: gID,
        masterkey: masterkey,
        tID: tID
    };

    jQuery.ajax({
        type: TYPE,
        url: URL,
        data: dataSet,
        success: function (html) {

            jQuery("#loadLevelTypeID").show();
            jQuery("#loadLevelTypeID").html(html)
            jQuery("#loadWaitingCategory").hide();
        }
    });
}


function loadDownloadSelectGroup(gID, masterkey, tID) {
    // alert('test');
    jQuery("#loadWaitingCategory").show();

    var TYPE = "POST";
    var URL = "../mod_cmsgml/load_selectGroup.php";
    var dataSet = {
        gID: gID,
        masterkey: masterkey,
        tID: tID
    };

    jQuery.ajax({
        type: TYPE,
        url: URL,
        data: dataSet,
        success: function (html) {

            jQuery("#loadLevelGroupID").show();
            jQuery("#loadLevelGroupID").html(html)
            jQuery("#loadWaitingCategory").hide();
        }
    });
}




function updateContactNew(fileAc) {

    jQuery.blockUI({
        message: jQuery('#tallContent'),
        css: {
            border: 'none',
            padding: '35px',
            backgroundColor: '#000',
            '-webkit-border-radius': '10px',
            '-moz-border-radius': '10px',
            opacity: .9,
            color: '#fff'
        }
    });


    var TYPE = "POST";
    var URL = fileAc;

    var dataSet = jQuery("#myForm").serialize();

    jQuery.ajax({
        type: TYPE,
        url: URL,
        data: dataSet,
        success: function (html) {
            jQuery("#loadCheckComplete").show();
            jQuery("#loadCheckComplete").html(html);
            setTimeout(jQuery.unblockUI, 200);

        }
    });
}


function syncContactNew(fileAc) {

    jQuery.blockUI({
        message: jQuery('#tallContent'),
        css: {
            border: 'none',
            padding: '35px',
            backgroundColor: '#000',
            '-webkit-border-radius': '10px',
            '-moz-border-radius': '10px',
            opacity: .9,
            color: '#fff'
        }
    });


    var TYPE = "POST";
    var URL = fileAc;

    var dataSet = jQuery("#myForm").serialize();

    jQuery.ajax({
        type: TYPE,
        url: URL,
        data: dataSet,
        success: function (html) {

            jQuery("#loadCheckComplete").show();
            jQuery("#loadCheckComplete").html(html);
            setTimeout(jQuery.unblockUI, 200);

        }
    });
}



function reportPDF(fileAc) {

    jQuery.blockUI({
        message: jQuery('#tallContent'),
        css: {
            border: 'none',
            padding: '35px',
            backgroundColor: '#000',
            '-webkit-border-radius': '10px',
            '-moz-border-radius': '10px',
            opacity: .9,
            color: '#fff'
        }
    });


    var TYPE = "POST";
    var URL = fileAc;

    var dataSet = jQuery("#myForm").serialize();

    jQuery.ajax({
        type: TYPE,
        url: URL,
        data: dataSet,
        success: function (html) {

            jQuery("#loadCheckComplete").show();
            jQuery("#loadCheckComplete").html(html);
            setTimeout(jQuery.unblockUI, 200);

        }
    });
}


function delContactNew(fileAc) {

    jQuery.blockUI({
        message: jQuery('#tallContent'),
        css: {
            border: 'none',
            padding: '35px',
            backgroundColor: '#000',
            '-webkit-border-radius': '10px',
            '-moz-border-radius': '10px',
            opacity: .9,
            color: '#fff'
        }
    });


    var TYPE = "POST";
    var URL = fileAc;

    var dataSet = jQuery("#myForm").serialize();

    jQuery.ajax({
        type: TYPE,
        url: URL,
        data: dataSet,
        success: function (html) {

            jQuery("#loadCheckComplete").show();
            jQuery("#loadCheckComplete").html(html);
            setTimeout(jQuery.unblockUI, 200);

        }
    });
}


function viewContactNew(fileAc) {

    jQuery.blockUI({
        message: jQuery('#tallContent'),
        css: {
            border: 'none',
            padding: '35px',
            backgroundColor: '#000',
            '-webkit-border-radius': '10px',
            '-moz-border-radius': '10px',
            opacity: .9,
            color: '#fff'
        }
    });


    var TYPE = "POST";
    var URL = fileAc;

    var dataSet = jQuery("#myFormHome").serialize();

    jQuery.ajax({
        type: TYPE,
        url: URL,
        data: dataSet,
        success: function (html) {

            jQuery("#boxContantLoad").show();
            jQuery("#boxContantLoad").html(html);
            setTimeout(jQuery.unblockUI, 200);

        }
    });
}


function changeStatus(loaddder, tablename, statusname, statusid, loadderstatus, fileAc) {

    jQuery("#" + loaddder + "").show();

    var TYPE = "POST";
    var URL = fileAc;
    var dataSet = {
        Valueloaddder: loaddder,
        Valuetablename: tablename,
        Valuestatusname: statusname,
        Valuestatusid: statusid,
        Valueloadderstatus: loadderstatus,
        Valuefilestatus: fileAc
    };


    jQuery.ajax({
        type: TYPE,
        url: URL,
        data: dataSet,
        success: function (html) {

            jQuery("#" + loadderstatus + "").show();
            jQuery("#" + loadderstatus + "").html(html);
            jQuery("#" + loaddder + "").hide();
        }
    });
}

function changeStatusAll(loaddder, tablename, statusname, statusid, loadderstatus, fileAc) {

    $(document).find('.statusList').each(function () {

        id = $(this).attr('id');  // ดึงค่า id
        data_statusid = $(this).data('id');
        if (loadderstatus != id) {
            changeStatus("load_waiting".data_statusid, tablename, "Enable", data_statusid, id, fileAc)
        }
    });

    jQuery("#" + loaddder + "").show();

    var TYPE = "POST";
    var URL = fileAc;

    var dataSet = {
        Valueloaddder: loaddder,
        Valuetablename: tablename,
        Valuestatusname: statusname,
        Valuestatusid: statusid,
        Valueloadderstatus: loadderstatus,
        Valuefilestatus: fileAc
    };

    jQuery.ajax({
        type: TYPE,
        url: URL,
        data: dataSet,
        success: function (html) {

            jQuery("#" + loadderstatus + "").show();
            jQuery("#" + loadderstatus + "").html(html);
            jQuery("#" + loaddder + "").hide();

        }
    });
}



function changeStatus2(loaddder, tablename, statusname, statusid, loadderstatus, fileAc, mid) {

    jQuery("#" + loaddder + "").show();

    var TYPE = "POST";
    var URL = fileAc;
    var dataSet = {
        Valueloaddder: loaddder,
        Valuetablename: tablename,
        Valuestatusname: statusname,
        Valuestatusid: statusid,
        Valueloadderstatus: loadderstatus,
        Valuefilestatus: fileAc,
        ValueMid: mid
    };


    jQuery.ajax({
        type: TYPE,
        url: URL,
        data: dataSet,
        success: function (html) {

            jQuery("#" + loadderstatus + "").show();
            jQuery("#" + loadderstatus + "").html(html);
            jQuery("#" + loaddder + "").hide();
        }
    });
}

function changeStatusHome(loaddder, tablename, statusname, statusid, loadderstatus, fileAc, MasterkeyVal) {

    jQuery("#" + loaddder + "").show();

    var TYPE = "POST";
    var URL = fileAc;
    var dataSet = {
        Valueloaddder: loaddder,
        Valuetablename: tablename,
        Valuestatusname: statusname,
        Valuestatusid: statusid,
        Valueloadderstatus: loadderstatus,
        Valuefilestatus: fileAc,
        ValMasterkey: MasterkeyVal
    };


    jQuery.ajax({
        type: TYPE,
        url: URL,
        data: dataSet,
        success: function (html) {

            jQuery("#" + loadderstatus + "").show();
            jQuery("#" + loadderstatus + "").html(html);
            jQuery("#" + loaddder + "").hide();
        }
    });
}

// function changeRibbon(tablename, statusname, statusid, fileAc) {

//     jQuery("#" + loaddder + "").show();

//     var TYPE = "POST";
//     var URL = fileAc;
//     var dataSet = {
//         Valuetablename: tablename,
//         Valuestatusname: statusname,
//         Valuestatusid: statusid,
//         Valuefilestatus: fileAc
//     };


//     jQuery.ajax({type: TYPE, url: URL, data: dataSet,
//         success: function (html) {

//             jQuery("#" + loadderstatus + "").show();
//             jQuery("#" + loadderstatus + "").html(html)
//             jQuery("#" + loaddder + "").hide();
//         }
//     });
// }

function sortingContactNew(fileAc) {

    jQuery.blockUI({
        message: jQuery('#tallContent'),
        css: {
            border: 'none',
            padding: '35px',
            backgroundColor: '#000',
            '-webkit-border-radius': '10px',
            '-moz-border-radius': '10px',
            opacity: .9,
            color: '#fff'
        }
    });

    var TYPE = "POST";
    var URL = fileAc;
    var dataSet = jQuery("#myForm").serialize();
    //alert(dataSet);
    jQuery.ajax({
        type: TYPE,
        url: URL,
        data: dataSet,
        success: function (html) {
            jQuery("#loadCheckComplete").show();
            jQuery("#loadCheckComplete").html(html);
            setTimeout(jQuery.unblockUI, 200);
        }
    });

}

function btnBackPage(fileAc) {
    document.myFormHome.action = fileAc;
    document.myFormHome.submit();
}


function checkUsermember(username) {

    jQuery.blockUI({
        message: jQuery('#tallContent'),
        css: {
            border: 'none',
            padding: '35px',
            backgroundColor: '#000',
            '-webkit-border-radius': '10px',
            '-moz-border-radius': '10px',
            opacity: .9,
            color: '#fff'
        }
    });

    var TYPE = "POST";
    var URL = "../core/checkUser.php";
    var dataSet = jQuery("#myForm").serialize();

    jQuery.ajax({
        type: TYPE,
        url: URL,
        data: dataSet,
        success: function (html) {

            jQuery("#loadCheckComplete").show();
            jQuery("#loadCheckComplete").html(html);
            setTimeout(jQuery.unblockUI, 200);
        }
    });
}

function checkUsermemberEdit(userid, username) {

    jQuery.blockUI({
        message: jQuery('#tallContent'),
        css: {
            border: 'none',
            padding: '35px',
            backgroundColor: '#000',
            '-webkit-border-radius': '10px',
            '-moz-border-radius': '10px',
            opacity: .9,
            color: '#fff'
        }
    });

    var TYPE = "POST";
    var URL = "../core/checkUserEdit.php";
    var dataSet = {
        Valueuserid: userid,
        Valueusername: username
    };

    jQuery.ajax({
        type: TYPE,
        url: URL,
        data: dataSet,
        success: function (html) {

            jQuery("#loadCheckComplete").show();
            jQuery("#loadCheckComplete").html(html);
            setTimeout(jQuery.unblockUI, 200);
        }
    });
}

function sortingContactHome(fileAc) {

    jQuery.blockUI({
        message: jQuery('#tallContent'),
        css: {
            border: 'none',
            padding: '35px',
            backgroundColor: '#000',
            '-webkit-border-radius': '10px',
            '-moz-border-radius': '10px',
            opacity: .9,
            color: '#fff'
        }
    });

    var TYPE = "POST";
    var URL = fileAc;
    var dataSet = jQuery("#myFormSort").serialize();
    //alert(dataSet);
    jQuery.ajax({
        type: TYPE,
        url: URL,
        data: dataSet,
        success: function (html) {
            jQuery("#loadCheckComplete").show();
            jQuery("#loadCheckComplete").html(html);
            setTimeout(jQuery.unblockUI, 200);
        }
    });

}

function loadContantHome(fileAc, divAc, masterkey, menukeyid) {

    var TYPE = "POST";
    var URL = fileAc;
    var dataSet = { masterkey: masterkey, menukeyid: menukeyid };
    //alert(dataSet);
    jQuery.ajax({
        type: TYPE,
        url: URL,
        data: dataSet,
        success: function (html) {
            jQuery("#" + divAc).show();
            jQuery("#" + divAc).html(html);
        }
    });

}


function delContactHome(fileAc, delID, divAc) {

    jQuery.blockUI({
        message: jQuery('#tallContent'),
        css: {
            border: 'none',
            padding: '35px',
            backgroundColor: '#000',
            '-webkit-border-radius': '10px',
            '-moz-border-radius': '10px',
            opacity: .9,
            color: '#fff'
        }
    });

    var TYPE = "POST";
    var URL = fileAc;
    var dataSet = { delID: delID };
    //alert(dataSet);
    jQuery.ajax({
        type: TYPE,
        url: URL,
        data: dataSet,
        success: function (html) {
            jQuery("#loadCheckComplete").show();
            jQuery("#loadCheckComplete").html(html);
            jQuery("#" + divAc).remove();
            setTimeout(jQuery.unblockUI, 200);
        }
    });

}


function addContactBox(fileAc, delID, divHide, divShow) {

    jQuery.blockUI({
        message: jQuery('#tallContent'),
        css: {
            border: 'none',
            padding: '35px',
            backgroundColor: '#000',
            '-webkit-border-radius': '10px',
            '-moz-border-radius': '10px',
            opacity: .9,
            color: '#fff'
        }
    });


    var TYPE = "POST";
    var URL = fileAc;

    var dataSet = { delID: delID, divShow: divShow };

    jQuery.ajax({
        type: TYPE,
        url: URL,
        data: dataSet,
        success: function (html) {

            jQuery("#loadCheckComplete").show();
            jQuery("#loadCheckComplete").html(html);
            jQuery("#" + divHide).hide();
            jQuery("#" + divShow).show();
            setTimeout(jQuery.unblockUI, 200);

        }
    });
}




function delContactBox(fileAc, delID, divHide, divShow) {

    jQuery.blockUI({
        message: jQuery('#tallContent'),
        css: {
            border: 'none',
            padding: '35px',
            backgroundColor: '#000',
            '-webkit-border-radius': '10px',
            '-moz-border-radius': '10px',
            opacity: .9,
            color: '#fff'
        }
    });


    var TYPE = "POST";
    var URL = fileAc;

    var dataSet = { delID: delID };

    jQuery.ajax({
        type: TYPE,
        url: URL,
        data: dataSet,
        success: function (html) {

            jQuery("#loadCheckComplete").show();
            jQuery("#loadCheckComplete").html(html);
            jQuery("#" + divHide).hide();
            jQuery("#" + divShow).show();
            setTimeout(jQuery.unblockUI, 200);

        }
    });
}


function loadContantLogHome(fileAc) {

    var TYPE = "POST";
    var URL = fileAc;
    var dataSet = {};
    //alert(dataSet);
    jQuery.ajax({
        type: TYPE,
        url: URL,
        data: dataSet,
        success: function (html) {
            jQuery("#loadContantLogHome").show();
            jQuery("#loadContantLogHome").html(html);
        }
    });

}

function delFileUpload(fileAc) {

    jQuery.blockUI({
        message: jQuery('#tallContent'),
        css: {
            border: 'none',
            padding: '35px',
            backgroundColor: '#000',
            '-webkit-border-radius': '10px',
            '-moz-border-radius': '10px',
            opacity: .9,
            color: '#fff'
        }
    });


    var TYPE = "POST";
    var URL = fileAc;

    var dataSet = jQuery("#myForm").serialize();

    jQuery.ajax({
        type: TYPE,
        url: URL,
        data: dataSet,
        success: function (html) {

            jQuery("#boxFileNew").show();
            jQuery("#boxFileNew").html(html);
            setTimeout(jQuery.unblockUI, 200);

        }
    });
}

function delFileUploadG(fileAc, elm = '#boxFileNew') {

    jQuery.blockUI({
        message: jQuery('#tallContent'),
        css: {
            border: 'none',
            padding: '35px',
            backgroundColor: '#000',
            '-webkit-border-radius': '10px',
            '-moz-border-radius': '10px',
            opacity: .9,
            color: '#fff'
        }
    });


    var TYPE = "POST";
    var URL = fileAc;

    var dataSet = jQuery("#myForm").serialize();

    jQuery.ajax({
        type: TYPE,
        url: URL,
        data: dataSet,
        success: function (html) {

            jQuery(elm).show();
            jQuery(elm).html(html);
            setTimeout(jQuery.unblockUI, 200);

        }
    });
}


function delFileUploadUp(fileAc) {

    jQuery.blockUI({
        message: jQuery('#tallContent'),
        css: {
            border: 'none',
            padding: '35px',
            backgroundColor: '#000',
            '-webkit-border-radius': '10px',
            '-moz-border-radius': '10px',
            opacity: .9,
            color: '#fff'
        }
    });


    var TYPE = "POST";
    var URL = fileAc;

    var dataSet = jQuery("#myForm").serialize();

    jQuery.ajax({
        type: TYPE,
        url: URL,
        data: dataSet,
        success: function (html) {

            jQuery("#boxFileNewUp").show();
            jQuery("#boxFileNewUp").html(html);
            setTimeout(jQuery.unblockUI, 200);

        }
    });
}

function delFileUploadAlone(fileAc) {

    jQuery.blockUI({
        message: jQuery('#tallContent'),
        css: {
            border: 'none',
            padding: '35px',
            backgroundColor: '#000',
            '-webkit-border-radius': '10px',
            '-moz-border-radius': '10px',
            opacity: .9,
            color: '#fff'
        }
    });


    var TYPE = "POST";
    var URL = fileAc;

    var dataSet = jQuery("#myForm").serialize();

    jQuery.ajax({
        type: TYPE,
        url: URL,
        data: dataSet,
        success: function (html) {

            jQuery("#boxFileNewAlone").show();
            jQuery("#boxFileNewAlone").html(html);
            setTimeout(jQuery.unblockUI, 200);

        }
    });
}

function delFileUploadB(fileAc) {

    jQuery.blockUI({
        message: jQuery('#tallContent'),
        css: {
            border: 'none',
            padding: '35px',
            backgroundColor: '#000',
            '-webkit-border-radius': '10px',
            '-moz-border-radius': '10px',
            opacity: .9,
            color: '#fff'
        }
    });


    var TYPE = "POST";
    var URL = fileAc;

    var dataSet = jQuery("#myForm").serialize();

    jQuery.ajax({
        type: TYPE,
        url: URL,
        data: dataSet,
        success: function (html) {

            jQuery("#boxFileNewBook").show();
            jQuery("#boxFileNewBook").html(html);
            setTimeout(jQuery.unblockUI, 200);

        }
    });
}



function delFileUploadD(fileAc) {

    jQuery.blockUI({
        message: jQuery('#tallContent'),
        css: {
            border: 'none',
            padding: '35px',
            backgroundColor: '#000',
            '-webkit-border-radius': '10px',
            '-moz-border-radius': '10px',
            opacity: .9,
            color: '#fff'
        }
    });


    var TYPE = "POST";
    var URL = fileAc;

    var dataSet = jQuery("#myForm").serialize();

    jQuery.ajax({
        type: TYPE,
        url: URL,
        data: dataSet,
        success: function (html) {

            jQuery("#boxFileNew").show();
            jQuery("#boxFileNew").html(html);
            setTimeout(jQuery.unblockUI, 200);

        }
    });
}


// function delPicUpload(fileAc,elm = '#boxPicNew') {

//     jQuery.blockUI({
//         message: jQuery('#tallContent'),
//         css: {
//             border: 'none',
//             padding: '35px',
//             backgroundColor: '#000',
//             '-webkit-border-radius': '10px',
//             '-moz-border-radius': '10px',
//             opacity: .9,
//             color: '#fff'
//         }
//     });


//     var TYPE = "POST";
//     var URL = fileAc;

//     var dataSet = jQuery("#myForm").serialize();

//     jQuery.ajax({
//         type: TYPE,
//         url: URL,
//         data: dataSet,
//         success: function (html) {

//             jQuery(elm).show();
//             jQuery(elm).html(html);
//             setTimeout(jQuery.unblockUI, 200);

//         }
//     });
// }

function delPicUpload(fileAc, elm = '#boxPicNew') {
    if (confirm('Are you sure you want to delete this file?')) {

        jQuery.blockUI({
            message: jQuery('#tallContent'),
            css: {
                border: 'none',
                padding: '35px',
                backgroundColor: '#000',
                '-webkit-border-radius': '10px',
                '-moz-border-radius': '10px',
                opacity: .9,
                color: '#fff'
            }
        });

        var TYPE = "POST";
        var URL = fileAc;
        var dataSet = {};
        var picnameVal = jQuery("#picname").val();
        var editIdVal = jQuery("#valEditID").val() || jQuery("input[name='valEditID']").val();

        if (typeof picnameVal !== "undefined") {
            dataSet.picname = picnameVal;
        }
        if (typeof editIdVal !== "undefined" && editIdVal !== "") {
            dataSet.valEditID = editIdVal;
        }
        if (jQuery.isEmptyObject(dataSet)) {
            dataSet = jQuery("#myForm").serialize();
        }

        jQuery.ajax({
            type: TYPE,
            url: URL,
            data: dataSet,
            success: function (html) {
                jQuery(elm).show();
                if (typeof html === "string" && jQuery.trim(html) !== "") {
                    jQuery(elm).html(html);
                } else {
                    jQuery(elm).html('<input type="hidden" name="picname" id="picname" value="" />');
                }
                setTimeout(jQuery.unblockUI, 200);
                // alert('The file has been deleted successfully.');
            },
            error: function () {
                jQuery.unblockUI();
                alert('Failed to delete the file. Please try again.');
            }
        });
    }
}




/* function modDeleteFileUpdateEnews(downloadNewID,menuid,contantNewid) {
 
 jQuery("#load_contantfile").show();
 
 var TYPE="POST";
 var URL="../mod_enews/deletefileupdate.php";
 var dataSet={ 
 downloadNewID : downloadNewID,
 menuid : menuid,
 contantNewid : contantNewid
 
 };
 jQuery.ajax({type:TYPE,url:URL,data:dataSet,
 success:function(html){
 
 jQuery("#load_filenew").show();
 jQuery("#load_filenew").html(html)
 jQuery("#load_contantfile").hide();
 }
 }); 
 }*/

function modDeleteFileUpdateEnews(downloadNewID, menuid, contantNewid) {

    /*jQuery.blockUI({
     message: jQuery('#tallContent'),
     css: {border: 'none', padding: '35px', backgroundColor: '#000', '-webkit-border-radius': '10px', '-moz-border-radius': '10px', opacity: .9, color: '#fff'
     }
     });*/

    // alert(downloadNewID+' : '+ menuid +' '+contantNewid);

    // jQuery("#load_contantfile").show();

    var TYPE = "POST";
    var URL = "../mod_enews/deletefileupdate.php";
    var dataSet = {
        downloadNewID: downloadNewID,
        menuid: menuid,
        contantNewid: contantNewid

    };
    jQuery.ajax({
        type: TYPE,
        url: URL,
        data: dataSet,
        success: function (html) {

            jQuery("#boxFileNew").show();
            jQuery("#boxFileNew").html(html)
            //jQuery("#load_contantfile").hide();
        }
    });
}



function delPicUploadVote1(fileAc) {

    jQuery.blockUI({
        message: jQuery('#tallContent'),
        css: {
            border: 'none',
            padding: '35px',
            backgroundColor: '#000',
            '-webkit-border-radius': '10px',
            '-moz-border-radius': '10px',
            opacity: .9,
            color: '#fff'
        }
    });


    var TYPE = "POST";
    var URL = fileAc;

    var dataSet = jQuery("#myForm").serialize();

    jQuery.ajax({
        type: TYPE,
        url: URL,
        data: dataSet,
        success: function (html) {

            jQuery("#boxVotePicNew1").show();
            jQuery("#boxVotePicNew1").html(html);
            setTimeout(jQuery.unblockUI, 200);

        }
    });
}

function delPicUploadVote2(fileAc) {

    jQuery.blockUI({
        message: jQuery('#tallContent'),
        css: {
            border: 'none',
            padding: '35px',
            backgroundColor: '#000',
            '-webkit-border-radius': '10px',
            '-moz-border-radius': '10px',
            opacity: .9,
            color: '#fff'
        }
    });


    var TYPE = "POST";
    var URL = fileAc;

    var dataSet = jQuery("#myForm").serialize();

    jQuery.ajax({
        type: TYPE,
        url: URL,
        data: dataSet,
        success: function (html) {

            jQuery("#boxVotePicNew2").show();
            jQuery("#boxVotePicNew2").html(html);
            setTimeout(jQuery.unblockUI, 200);

        }
    });
}

function delPicUploadVote3(fileAc) {

    jQuery.blockUI({
        message: jQuery('#tallContent'),
        css: {
            border: 'none',
            padding: '35px',
            backgroundColor: '#000',
            '-webkit-border-radius': '10px',
            '-moz-border-radius': '10px',
            opacity: .9,
            color: '#fff'
        }
    });


    var TYPE = "POST";
    var URL = fileAc;

    var dataSet = jQuery("#myForm").serialize();

    jQuery.ajax({
        type: TYPE,
        url: URL,
        data: dataSet,
        success: function (html) {

            jQuery("#boxVotePicNew3").show();
            jQuery("#boxVotePicNew3").html(html);
            setTimeout(jQuery.unblockUI, 200);

        }
    });
}

function delPicUploadVote4(fileAc) {

    jQuery.blockUI({
        message: jQuery('#tallContent'),
        css: {
            border: 'none',
            padding: '35px',
            backgroundColor: '#000',
            '-webkit-border-radius': '10px',
            '-moz-border-radius': '10px',
            opacity: .9,
            color: '#fff'
        }
    });


    var TYPE = "POST";
    var URL = fileAc;

    var dataSet = jQuery("#myForm").serialize();

    jQuery.ajax({
        type: TYPE,
        url: URL,
        data: dataSet,
        success: function (html) {

            jQuery("#boxVotePicNew4").show();
            jQuery("#boxVotePicNew4").html(html);
            setTimeout(jQuery.unblockUI, 200);

        }
    });
}

function delPicUploadIcon(fileAc) {

    jQuery.blockUI({
        message: jQuery('#tallContent'),
        css: {
            border: 'none',
            padding: '35px',
            backgroundColor: '#000',
            '-webkit-border-radius': '10px',
            '-moz-border-radius': '10px',
            opacity: .9,
            color: '#fff'
        }
    });


    var TYPE = "POST";
    var URL = fileAc;

    var dataSet = jQuery("#myForm").serialize();

    jQuery.ajax({
        type: TYPE,
        url: URL,
        data: dataSet,
        success: function (html) {

            jQuery("#boxPicIcon").show();
            jQuery("#boxPicIcon").html(html);
            setTimeout(jQuery.unblockUI, 200);

        }
    });
}

function delPicUploadSite(fileAc, box) {

    jQuery.blockUI({
        message: jQuery('#tallContent'),
        css: {
            border: 'none',
            padding: '35px',
            backgroundColor: '#000',
            '-webkit-border-radius': '10px',
            '-moz-border-radius': '10px',
            opacity: .9,
            color: '#fff'
        }
    });


    var TYPE = "POST";
    var URL = fileAc;

    var dataSet = jQuery("#myForm").serialize();

    jQuery.ajax({
        type: TYPE,
        url: URL,
        data: dataSet,
        success: function (html) {

            jQuery("#" + box).show();
            jQuery("#" + box).html(html);
            setTimeout(jQuery.unblockUI, 200);

        }
    });
}

function delPicUploadTicket(fileAc) {

    jQuery.blockUI({
        message: jQuery('#tallContent'),
        css: {
            border: 'none',
            padding: '35px',
            backgroundColor: '#000',
            '-webkit-border-radius': '10px',
            '-moz-border-radius': '10px',
            opacity: .9,
            color: '#fff'
        }
    });


    var TYPE = "POST";
    var URL = fileAc;

    var dataSet = jQuery("#myForm").serialize();

    jQuery.ajax({
        type: TYPE,
        url: URL,
        data: dataSet,
        success: function (html) {

            jQuery("#boxPicNewTicket").show();
            jQuery("#boxPicNewTicket").html(html);
            setTimeout(jQuery.unblockUI, 200);

        }
    });
}


function delPicUploadT(fileAc) {

    jQuery.blockUI({
        message: jQuery('#tallContent'),
        css: {
            border: 'none',
            padding: '35px',
            backgroundColor: '#000',
            '-webkit-border-radius': '10px',
            '-moz-border-radius': '10px',
            opacity: .9,
            color: '#fff'
        }
    });


    var TYPE = "POST";
    var URL = fileAc;

    var dataSet = jQuery("#myForm").serialize();

    jQuery.ajax({
        type: TYPE,
        url: URL,
        data: dataSet,
        success: function (html) {

            jQuery("#boxPicNewT").show();
            jQuery("#boxPicNewT").html(html);
            setTimeout(jQuery.unblockUI, 200);

        }
    });
}



function delPicUploadMap(fileAc) {

    jQuery.blockUI({
        message: jQuery('#tallContent'),
        css: {
            border: 'none',
            padding: '35px',
            backgroundColor: '#000',
            '-webkit-border-radius': '10px',
            '-moz-border-radius': '10px',
            opacity: .9,
            color: '#fff'
        }
    });


    var TYPE = "POST";
    var URL = fileAc;

    var dataSet = jQuery("#myForm").serialize();

    jQuery.ajax({
        type: TYPE,
        url: URL,
        data: dataSet,
        success: function (html) {

            jQuery("#boxPicNewMap").show();
            jQuery("#boxPicNewMap").html(html);
            setTimeout(jQuery.unblockUI, 200);

        }
    });
}

function delPicUploadC(fileAc) {

    jQuery.blockUI({
        message: jQuery('#tallContent'),
        css: {
            border: 'none',
            padding: '35px',
            backgroundColor: '#000',
            '-webkit-border-radius': '10px',
            '-moz-border-radius': '10px',
            opacity: .9,
            color: '#fff'
        }
    });


    var TYPE = "POST";
    var URL = fileAc;

    var dataSet = jQuery("#myForm").serialize();

    jQuery.ajax({
        type: TYPE,
        url: URL,
        data: dataSet,
        success: function (html) {

            jQuery("#boxPicNewPic").show();
            jQuery("#boxPicNewPic").html(html);
            setTimeout(jQuery.unblockUI, 200);

        }
    });
}

function delPicUploadHead(fileAc) {

    jQuery.blockUI({
        message: jQuery('#tallContent'),
        css: {
            border: 'none',
            padding: '35px',
            backgroundColor: '#000',
            '-webkit-border-radius': '10px',
            '-moz-border-radius': '10px',
            opacity: .9,
            color: '#fff'
        }
    });


    var TYPE = "POST";
    var URL = fileAc;

    var dataSet = jQuery("#myForm").serialize();

    jQuery.ajax({
        type: TYPE,
        url: URL,
        data: dataSet,
        success: function (html) {

            jQuery("#boxPicNewHead").show();
            jQuery("#boxPicNewHead").html(html);
            setTimeout(jQuery.unblockUI, 200);

        }
    });
}

function delAlbumUpload(fileAc) {

    jQuery.blockUI({
        message: jQuery('#tallContent'),
        css: {
            border: 'none',
            padding: '35px',
            backgroundColor: '#000',
            '-webkit-border-radius': '10px',
            '-moz-border-radius': '10px',
            opacity: .9,
            color: '#fff'
        }
    });


    var TYPE = "POST";
    var URL = fileAc;

    var dataSet = jQuery("#myForm").serialize();

    jQuery.ajax({
        type: TYPE,
        url: URL,
        data: dataSet,
        success: function (html) {

            jQuery("#boxAlbumNew").show();
            jQuery("#boxAlbumNew").html(html);
            setTimeout(jQuery.unblockUI, 200);

        }
    });
}


function delVideoUpload(fileAc) {

    jQuery.blockUI({
        message: jQuery('#tallContent'),
        css: {
            border: 'none',
            padding: '35px',
            backgroundColor: '#000',
            '-webkit-border-radius': '10px',
            '-moz-border-radius': '10px',
            opacity: .9,
            color: '#fff'
        }
    });


    var TYPE = "POST";
    var URL = fileAc;

    var dataSet = jQuery("#myForm").serialize();

    jQuery.ajax({
        type: TYPE,
        url: URL,
        data: dataSet,
        success: function (html) {

            jQuery("#boxVideoNew").show();
            jQuery("#boxVideoNew").html(html);
            setTimeout(jQuery.unblockUI, 200);

        }
    });
}




function delColUpload(fileAc) {

    jQuery.blockUI({
        message: jQuery('#tallContent'),
        css: {
            border: 'none',
            padding: '35px',
            backgroundColor: '#000',
            '-webkit-border-radius': '10px',
            '-moz-border-radius': '10px',
            opacity: .9,
            color: '#fff'
        }
    });


    var TYPE = "POST";
    var URL = fileAc;

    var dataSet = jQuery("#myForm").serialize();

    jQuery.ajax({
        type: TYPE,
        url: URL,
        data: dataSet,
        success: function (html) {

            jQuery("#boxLoadColorShow").show();
            jQuery("#boxLoadColorShow").html(html);
            setTimeout(jQuery.unblockUI, 200);

        }
    });
}



function delAlbumUploadIn(fileAc) {

    jQuery.blockUI({
        message: jQuery('#tallContent'),
        css: {
            border: 'none',
            padding: '35px',
            backgroundColor: '#000',
            '-webkit-border-radius': '10px',
            '-moz-border-radius': '10px',
            opacity: .9,
            color: '#fff'
        }
    });


    var TYPE = "POST";
    var URL = fileAc;

    var dataSet = jQuery("#myForm").serialize();

    jQuery.ajax({
        type: TYPE,
        url: URL,
        data: dataSet,
        success: function (html) {

            jQuery("#boxAlbumNewIn").show();
            jQuery("#boxAlbumNewIn").html(html);
            setTimeout(jQuery.unblockUI, 200);

        }
    });
}

function delAlbumUploadOut(fileAc) {

    jQuery.blockUI({
        message: jQuery('#tallContent'),
        css: {
            border: 'none',
            padding: '35px',
            backgroundColor: '#000',
            '-webkit-border-radius': '10px',
            '-moz-border-radius': '10px',
            opacity: .9,
            color: '#fff'
        }
    });


    var TYPE = "POST";
    var URL = fileAc;

    var dataSet = jQuery("#myForm").serialize();

    jQuery.ajax({
        type: TYPE,
        url: URL,
        data: dataSet,
        success: function (html) {

            jQuery("#boxAlbumNewOut").show();
            jQuery("#boxAlbumNewOut").html(html);
            setTimeout(jQuery.unblockUI, 200);

        }
    });
}




// ####################################### End Home ################################################# //
// ####################################### Start FCK ################################################# //
// function onLoadFCK() {
//     if (!CKEDITOR.env.ie || CKEDITOR.env.version > 7)
//         CKEDITOR.env.isCompatible = true;
//     // var roxyFileman = '/scotch/fileman/index.html';
//     var roxyFileman = '/fileman/index.html';
//     CKEDITOR.replace('editDetail', {
//         //filebrowserUploadUrl: "../../ckeditor/ckupload.php",
//         filebrowserUploadUrl: "../../ckeditor/ckupload.php",
//         filebrowserBrowseUrl: roxyFileman,
//         filebrowserImageBrowseUrl: roxyFileman + '?type=image',
//         extraPlugins: 'tableresize,tabletools,quicktable',
//         removeDialogTabs: 'link:upload;image:upload',
//         toolbar: [
//             { name: 'document', groups: ['mode', 'document', 'doctools'], items: ['Source', '-', '-', '-', '-', '-', '-', '-'] },
//             { name: 'clipboard', groups: ['clipboard', 'undo'], items: ['Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo', 'RemoveFormat'] },
//             { name: 'editing', groups: ['find', 'selection', 'spellchecker'], items: ['Find', 'Replace', '-', 'SelectAll', '-', 'Scayt'] },
//             { name: 'forms', items: ['Form', 'Checkbox', 'Radio', 'TextField', 'Textarea', 'Select', 'Button', 'ImageButton', 'HiddenField'] },
//             '/',
//             { name: 'basicstyles', groups: ['basicstyles', 'cleanup'], items: ['Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', '-'] },
//             { name: 'paragraph', groups: ['list', 'indent', 'blocks', 'align', 'bidi'], items: ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', 'CreateDiv', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', '-', 'BidiLtr', 'BidiRtl', 'Language'] },
//             { name: 'links', items: ['Link', 'Unlink', 'Anchor'] },
//             { name: 'insert', items: ['Image', '-', 'Table', 'HorizontalRule', 'Smiley', 'SpecialChar', 'PageBreak', 'Iframe'] },
//             '/',
//             { name: 'styles', items: ['Font', 'FontSize'] },
//             { name: 'colors', items: ['TextColor', 'BGColor'] },
//             { name: 'tools', items: ['Maximize', '-'] },
//             { name: 'others', items: ['-'] },
//             { name: 'about', items: ['-'] }
//         ]
//     });
// }

// function onLoadFCK() {
//     // ชี้ไปที่ RoxyFileman ของคุณ
//     var roxyFileman = '/fileman/index.html';  // ปรับ path ตามจริง

//     // ---- ปลั๊กอินเล็ก ๆ เพื่อสร้างปุ่ม Fileman ----
//     (function () {
//         function openRoxy(editor, type) {
//             var url = roxyFileman + (roxyFileman.indexOf('?') >= 0 ? '&' : '?') + (type === 'image' ? 'type=image' : 'type=file');

//             // สร้าง callback ให้ Roxy ส่งค่า url กลับมา
//             var fn = CKEDITOR.tools.addFunction(function (fileUrl) {
//                 if (!fileUrl) return;
//                 // แทรกเป็นรูปหรือเป็นลิงก์ ตาม type
//                 if (type === 'image') {
//                     editor.insertHtml('<img src="' + CKEDITOR.tools.htmlEncode(fileUrl) + '" alt="" />');
//                 } else {
//                     var name = fileUrl.split('/').pop();
//                     editor.insertHtml('<a href="' + CKEDITOR.tools.htmlEncode(fileUrl) + '" target="_blank" rel="noopener">'
//                         + CKEDITOR.tools.htmlEncode(name) + '</a>');
//                 }
//             });

//             // ใส่พารามิเตอร์สำหรับ CKEditor callback ให้ Roxy
//             url += '&CKEditor=' + encodeURIComponent(editor.name) + '&CKEditorFuncNum=' + fn;

//             // เปิดหน้าต่าง Fileman
//             window.open(url, 'roxyfm', 'width=900,height=600,modal=yes,alwaysRaised=yes');
//         }

//         CKEDITOR.plugins.add('filemanBtn', {
//             init: function (editor) {
//                 editor.addCommand('RoxyFile', { exec: function (ed) { openRoxy(ed, 'file'); } });
//                 editor.addCommand('RoxyImage', { exec: function (ed) { openRoxy(ed, 'image'); } });

//                 editor.ui.addButton('FilemanFile', { label: 'อัปโหลดไฟล์ (Fileman)', command: 'RoxyFile', toolbar: 'insert' });
//                 editor.ui.addButton('FilemanImage', { label: 'อัปโหลดรูป (Fileman)', command: 'RoxyImage', toolbar: 'insert' });
//             }
//         });
//     })();

//     CKEDITOR.replace('editDetail', {
//         // ใช้ Fileman เป็นตัว browse
//         filebrowserBrowseUrl: roxyFileman,
//         // filebrowserImageBrowseUrl: roxyFileman + '?type=image',

//         // // ถ้าเน้นอัปโหลดผ่าน Fileman ให้คงไว้ (ซ่อนแท็บ Upload ใน dialog เดิมของ CKEditor)
//         // removeDialogTabs: 'link:upload;image:upload',

//         filebrowserBrowseUrl: roxyFileman + '?type=file',   // <— เพิ่ม ?type=file
//         filebrowserImageBrowseUrl: roxyFileman + '?type=image',
//         removeDialogTabs: 'link:upload;image:upload',

//         // โหลดปลั๊กอินปุ่ม
//         extraPlugins: 'tableresize,tabletools,quicktable,filemanBtn',

//         // เพิ่มปุ่ม FilemanFile / FilemanImage ใน toolbar
//         toolbar: [
//             { name: 'document', groups: ['mode', 'document', 'doctools'], items: ['Source'] },
//             { name: 'clipboard', groups: ['clipboard', 'undo'], items: ['Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo', 'RemoveFormat'] },
//             { name: 'editing', groups: ['find', 'selection', 'spellchecker'], items: ['Find', 'Replace', '-', 'SelectAll', '-', 'Scayt'] },
//             '/',
//             { name: 'basicstyles', groups: ['basicstyles', 'cleanup'], items: ['Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript'] },
//             { name: 'paragraph', groups: ['list', 'indent', 'blocks', 'align', 'bidi'], items: ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', 'CreateDiv', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', '-', 'BidiLtr', 'BidiRtl', 'Language'] },
//             { name: 'links', items: ['Link', 'Unlink', 'Anchor'] },
//             { name: 'insert', items: ['Image', '-', 'Table', 'HorizontalRule', 'Smiley', 'SpecialChar', 'PageBreak', 'Iframe', '-', 'FilemanFile', 'FilemanImage'] },
//             '/',
//             { name: 'styles', items: ['Font', 'FontSize'] },
//             { name: 'colors', items: ['TextColor', 'BGColor'] },
//             { name: 'tools', items: ['Maximize'] }
//         ]
//     });
// }
function onLoadFCK(opts) {
    var roxy = (opts && opts.roxy) || '/fileman/index.html';
    var area = (opts && opts.id) || 'editDetail';
    var ckSrc = (opts && opts.ckSrc) || '/ckeditor/ckeditor.js';

    function registerYouTubeBtn() {
        // สร้าง URL แบบ absolute (โปรโตคอล+โดเมน) เพื่อกัน CKEditor เติม /ckeditor ข้างหน้า
        var ORIGIN = (location.origin || (location.protocol + '//' + location.host));
        var YT_ICON_URL = ORIGIN + '/ckeditor/assets/icons/youtube16.svg'; // <-- ให้มีไฟล์นี้จริง

        function parseYouTube(url) {
            var id = null, start = 0, m = url.match(/(?:v=|\/embed\/|youtu\.be\/|\/shorts\/)([A-Za-z0-9_-]{11})/);
            if (m) id = m[1];
            var t = (url.match(/[?&](?:t|start)=([^&]+)/) || [])[1];
            if (t) {
                if (/^\d+$/.test(t)) start = parseInt(t, 10);
                else { var h = (t.match(/(\d+)h/) || [])[1] || 0, mm = (t.match(/(\d+)m/) || [])[1] || 0, s = (t.match(/(\d+)s/) || [])[1] || 0; start = +h * 3600 + +mm * 60 + +s; }
            }
            return { id: id, start: start || 0 };
        }

        CKEDITOR.plugins.add('ytEmbedBtn', {
            init: function (editor) {
                editor.addCommand('InsertYouTube', {
                    exec: function (ed) {
                        var url = prompt('วางลิงก์ YouTube (watch / youtu.be / shorts / embed):');
                        if (!url) return;
                        var p = parseYouTube(url);
                        if (!p.id) { alert('ลิงก์ไม่ถูกต้อง'); return; }
                        var src = 'https://www.youtube.com/embed/' + p.id + '?rel=0' + (p.start ? ('&start=' + p.start) : '');
                        var html = '<div style="position:relative;padding-top:56.25%;height:0;overflow:hidden;max-width:100%;">'
                            + '<iframe src="' + CKEDITOR.tools.htmlEncode(src) + '" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen '
                            //  + 'style="position:absolute;top:0;left:0;width:100%;height:100%;"></iframe></div>';
                            + '></iframe></div>';
                        ed.insertHtml(html);
                    }
                });
                editor.ui.addButton('YouTube', {
                    label: 'แทรก YouTube',
                    command: 'InsertYouTube',
                    toolbar: 'insert,100',
                    icon: YT_ICON_URL // << ใช้ URL แบบ absolute
                });

                // กันบางสกิน/แคชที่ยังแปะผิด พอ UI พร้อมแล้ว บังคับ setStyle ซ้ำด้วย absolute URL
                editor.on('uiReady', function () {
                    var el = editor.container && editor.container.findOne('.cke_button__youtube .cke_button_icon');
                    if (el) { el.setStyle('background-image', 'url(' + YT_ICON_URL + ')'); el.setStyle('background-size', '16px 16px'); }
                });
            }
        });
    }

    function registerFilemanButtons() {
        CKEDITOR.plugins.add('filemanBtn', {
            init: function (editor) {
                function openRoxy(ed, type) {
                    var url = roxy + (roxy.indexOf('?') >= 0 ? '&' : '?') + (type === 'image' ? 'type=image' : 'type=file');
                    var fn = CKEDITOR.tools.addFunction(function (fileUrl) {
                        if (!fileUrl) return;
                        if (type === 'image') {
                            ed.insertHtml('<img src="' + CKEDITOR.tools.htmlEncode(fileUrl) + '" alt="">');
                        } else {
                            var name = fileUrl.split('/').pop();
                            ed.insertHtml('<a href="' + CKEDITOR.tools.htmlEncode(fileUrl) + '" target="_blank" rel="noopener">' + CKEDITOR.tools.htmlEncode(name) + '</a>');
                        }
                    });
                    url += '&CKEditor=' + encodeURIComponent(ed.name) + '&CKEditorFuncNum=' + fn;
                    window.open(url, 'roxyfm', 'width=900,height=600,modal=yes,alwaysRaised=yes');
                }
                editor.addCommand('RoxyFile', { exec: function (ed) { openRoxy(ed, 'file'); } });
                editor.addCommand('RoxyImage', { exec: function (ed) { openRoxy(ed, 'image'); } });
                editor.ui.addButton('FilemanFile', { label: 'อัปโหลดไฟล์ (Fileman)', command: 'RoxyFile', toolbar: 'insert,98', icon: 'link' });
                editor.ui.addButton('FilemanImage', { label: 'อัปโหลดรูป (Fileman)', command: 'RoxyImage', toolbar: 'insert,99', icon: 'image' });
            }
        });
    }

    function bindMaximizeFix(editor) {
        if (!editor || editor._dmcrMaximizeFixBound) return;
        editor._dmcrMaximizeFixBound = true;

        editor.on('maximize', function () {
            setTimeout(function () {
                if (!editor.container) return;

                var inner = editor.container.findOne('.cke_inner');
                var top = editor.container.findOne('.cke_top');
                if (inner) {
                    inner.setStyle('top', '0px');
                    inner.setStyle('left', '0px');
                }
                if (top) {
                    top.setStyle('display', 'block');
                    top.setStyle('visibility', 'visible');
                }

                editor.fire('resize');
            }, 0);
        });
    }

    function initEditor() {
        registerFilemanButtons();
        registerYouTubeBtn();

        var editor = CKEDITOR.replace(area, {
            filebrowserBrowseUrl: roxy + '?type=file',
            filebrowserImageBrowseUrl: roxy + '?type=image',
            removeDialogTabs: 'link:upload;image:upload',
            extraPlugins: 'tableresize,tabletools,quicktable,filemanBtn,ytEmbedBtn',
            allowedContent: true,
            extraAllowedContent: 'iframe[*]{*}(*);div[*]{*}(*);',
            baseFloatZIndex: 200000,
            toolbar: [
                { name: 'document', items: ['Source'] },
                { name: 'clipboard', items: ['Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo', 'RemoveFormat'] },
                '/',
                { name: 'basicstyles', items: ['Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript'] },
                { name: 'paragraph', items: ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock'] },
                { name: 'links', items: ['Link', 'Unlink', 'Anchor'] },
                { name: 'insert', items: ['Image', 'Table', 'HorizontalRule', 'SpecialChar', 'PageBreak', 'Iframe', '-', 'FilemanFile', 'FilemanImage', 'YouTube'] },
                '/',
                { name: 'styles', items: ['Font', 'FontSize'] },
                { name: 'colors', items: ['TextColor', 'BGColor'] },
                { name: 'tools', items: ['Maximize'] }
            ]
        });

        bindMaximizeFix(editor);
    }

    if (!window.CKEDITOR) {
        var s = document.createElement('script'); s.src = ckSrc; s.onload = initEditor; s.onerror = function () { console.error('โหลด CKEditor ไม่ได้', ckSrc); }; document.head.appendChild(s);
    } else {
        initEditor();
    }
}

// ####################################### End FCK ################################################# //

// ####################################### Start FCK ################################################# //
function onLoadFCKAbout() {

    if (!CKEDITOR.env.ie || CKEDITOR.env.version > 7)
        CKEDITOR.env.isCompatible = true;
    // var roxyFileman = '/fileman/index.html';
    var roxyFileman = '/fileman/index.html';
    CKEDITOR.replace('editDetailHome', {
        //filebrowserUploadUrl: "../../ckeditor/ckupload.php",
        filebrowserUploadUrl: "../../ckeditor/ckupload.php",
        filebrowserBrowseUrl: roxyFileman,
        filebrowserImageBrowseUrl: roxyFileman + '?type=image',
        extraPlugins: 'tableresize,tabletools,quicktable',
        removeDialogTabs: 'link:upload;image:upload',
        toolbar: [
            { name: 'document', groups: ['mode', 'document', 'doctools'], items: ['Source', '-', '-', '-', '-', '-', '-', '-'] },
            { name: 'clipboard', groups: ['clipboard', 'undo'], items: ['Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo', 'RemoveFormat'] },
            { name: 'editing', groups: ['find', 'selection', 'spellchecker'], items: ['Find', 'Replace', '-', 'SelectAll', '-', 'Scayt'] },
            { name: 'forms', items: ['Form', 'Checkbox', 'Radio', 'TextField', 'Textarea', 'Select', 'Button', 'ImageButton', 'HiddenField'] },
            '/',
            { name: 'basicstyles', groups: ['basicstyles', 'cleanup'], items: ['Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', '-'] },
            { name: 'paragraph', groups: ['list', 'indent', 'blocks', 'align', 'bidi'], items: ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', 'CreateDiv', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', '-', 'BidiLtr', 'BidiRtl', 'Language'] },
            { name: 'links', items: ['Link', 'Unlink', 'Anchor'] },
            { name: 'insert', items: ['Image', '-', 'Table', 'HorizontalRule', 'Smiley', 'SpecialChar', 'PageBreak', 'Iframe'] },
            '/',
            { name: 'styles', items: ['Font', 'FontSize'] },
            { name: 'colors', items: ['TextColor', 'BGColor'] },
            { name: 'tools', items: ['Maximize', '-'] },
            { name: 'others', items: ['-'] },
            { name: 'about', items: ['-'] }
        ]
    });
}

function onLoadFCKAbout1() {

    if (!CKEDITOR.env.ie || CKEDITOR.env.version > 7)
        CKEDITOR.env.isCompatible = true;
    // var roxyFileman = '/fileman/index.html';
    var roxyFileman = '/fileman/index.html';
    CKEDITOR.replace('editDetailHome1', {
        //filebrowserUploadUrl: "../../ckeditor/ckupload.php",
        filebrowserUploadUrl: "../../ckeditor/ckupload.php",
        filebrowserBrowseUrl: roxyFileman,
        filebrowserImageBrowseUrl: roxyFileman + '?type=image',
        extraPlugins: 'tableresize,tabletools,quicktable',
        removeDialogTabs: 'link:upload;image:upload',
        toolbar: [
            { name: 'document', groups: ['mode', 'document', 'doctools'], items: ['Source', '-', '-', '-', '-', '-', '-', '-'] },
            { name: 'clipboard', groups: ['clipboard', 'undo'], items: ['Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo', 'RemoveFormat'] },
            { name: 'editing', groups: ['find', 'selection', 'spellchecker'], items: ['Find', 'Replace', '-', 'SelectAll', '-', 'Scayt'] },
            { name: 'forms', items: ['Form', 'Checkbox', 'Radio', 'TextField', 'Textarea', 'Select', 'Button', 'ImageButton', 'HiddenField'] },
            '/',
            { name: 'basicstyles', groups: ['basicstyles', 'cleanup'], items: ['Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', '-'] },
            { name: 'paragraph', groups: ['list', 'indent', 'blocks', 'align', 'bidi'], items: ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', 'CreateDiv', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', '-', 'BidiLtr', 'BidiRtl', 'Language'] },
            { name: 'links', items: ['Link', 'Unlink', 'Anchor'] },
            { name: 'insert', items: ['Image', '-', 'Table', 'HorizontalRule', 'Smiley', 'SpecialChar', 'PageBreak', 'Iframe'] },
            '/',
            { name: 'styles', items: ['Font', 'FontSize'] },
            { name: 'colors', items: ['TextColor', 'BGColor'] },
            { name: 'tools', items: ['Maximize', '-'] },
            { name: 'others', items: ['-'] },
            { name: 'about', items: ['-'] }
        ]
    });
}

function onLoadFCKAbout2() {

    if (!CKEDITOR.env.ie || CKEDITOR.env.version > 7)
        CKEDITOR.env.isCompatible = true;
    // var roxyFileman = '/fileman/index.html';
    var roxyFileman = '/fileman/index.html';
    CKEDITOR.replace('editDetailHome2', {
        //filebrowserUploadUrl: "../../ckeditor/ckupload.php",
        filebrowserUploadUrl: "../../ckeditor/ckupload.php",
        filebrowserBrowseUrl: roxyFileman,
        filebrowserImageBrowseUrl: roxyFileman + '?type=image',
        extraPlugins: 'tableresize,tabletools,quicktable',
        removeDialogTabs: 'link:upload;image:upload',
        toolbar: [
            { name: 'document', groups: ['mode', 'document', 'doctools'], items: ['Source', '-', '-', '-', '-', '-', '-', '-'] },
            { name: 'clipboard', groups: ['clipboard', 'undo'], items: ['Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo', 'RemoveFormat'] },
            { name: 'editing', groups: ['find', 'selection', 'spellchecker'], items: ['Find', 'Replace', '-', 'SelectAll', '-', 'Scayt'] },
            { name: 'forms', items: ['Form', 'Checkbox', 'Radio', 'TextField', 'Textarea', 'Select', 'Button', 'ImageButton', 'HiddenField'] },
            '/',
            { name: 'basicstyles', groups: ['basicstyles', 'cleanup'], items: ['Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', '-'] },
            { name: 'paragraph', groups: ['list', 'indent', 'blocks', 'align', 'bidi'], items: ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', 'CreateDiv', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', '-', 'BidiLtr', 'BidiRtl', 'Language'] },
            { name: 'links', items: ['Link', 'Unlink', 'Anchor'] },
            { name: 'insert', items: ['Image', '-', 'Table', 'HorizontalRule', 'Smiley', 'SpecialChar', 'PageBreak', 'Iframe'] },
            '/',
            { name: 'styles', items: ['Font', 'FontSize'] },
            { name: 'colors', items: ['TextColor', 'BGColor'] },
            { name: 'tools', items: ['Maximize', '-'] },
            { name: 'others', items: ['-'] },
            { name: 'about', items: ['-'] }
        ]
    });
}

// ####################################### End FCK ################################################# //


// ####################################### Start FCK ################################################# //
function onLoadFCKMini() {
    if (!CKEDITOR.env.ie || CKEDITOR.env.version > 7)
        CKEDITOR.env.isCompatible = true;
    // var roxyFileman = '/scotch/fileman/index.html';
    var roxyFileman = '/fileman/index.html';
    CKEDITOR.replace('editDetail', {
        //filebrowserUploadUrl: "../../ckeditor/ckupload.php",
        filebrowserUploadUrl: "../../ckeditor/ckupload.php",
        filebrowserBrowseUrl: roxyFileman,
        filebrowserImageBrowseUrl: roxyFileman + '?type=image',
        extraPlugins: 'tableresize,tabletools,quicktable',
        removeDialogTabs: 'link:upload;image:upload',
        toolbar: [
            { name: 'basicstyles', groups: ['basicstyles', 'cleanup'], items: ['Bold', 'Italic', 'Underline', '-', '-', '-', '-', '-'] },
            { name: 'paragraph', groups: ['list', 'indent', 'blocks', 'align', 'bidi'], items: ['NumberedList', 'BulletedList', '-', '-', '-', '-', '-', '-', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', '-', '-', '-', '-'] },
            { name: 'insert', items: ['-', '-', '-', '-', 'Smiley', '-', '-', '-'] },
            { name: 'styles', items: ['-', 'FontSize'] },
            { name: 'tools', items: ['-', '-'] },
            { name: 'others', items: ['-'] },
            { name: 'about', items: ['-'] }
        ],
        height: '150px'
    });
}

function submitResetFck() {
    CKEDITOR.instances.editDetail.setData("");
}

// ####################################### End FCK ################################################# //


function changeStatusSlae(cID, valueID, filestatus) {

    jQuery.blockUI({
        message: jQuery('#tallContent'),
        css: {
            border: 'none',
            padding: '35px',
            backgroundColor: '#000',
            '-webkit-border-radius': '10px',
            '-moz-border-radius': '10px',
            opacity: .9,
            color: '#fff'
        }
    });

    var TYPE = "POST";
    var URL = "../" + filestatus + "";

    var dataSet = {
        cID: cID,
        valueID: valueID

    };
    jQuery.ajax({
        type: TYPE,
        url: URL,
        data: dataSet,
        success: function (html) {

            jQuery("#loadCheckComplete").show();
            jQuery("#loadCheckComplete").html(html);
            setTimeout(jQuery.unblockUI, 200);

        }
    });
}


function loadShowPhotoUpdate(fileAc, boxLoad) {

    jQuery.blockUI({
        message: jQuery('#tallContent'),
        css: {
            border: 'none',
            padding: '35px',
            backgroundColor: '#000',
            '-webkit-border-radius': '10px',
            '-moz-border-radius': '10px',
            opacity: .9,
            color: '#fff'
        }
    });


    var TYPE = "POST";
    var URL = fileAc;

    var dataSet = jQuery("#myForm").serialize();
    // alert(dataSet);
    // alert(URL);
    jQuery.ajax({
        type: TYPE,
        url: URL,
        data: dataSet,
        success: function (html) {
            // alert(html);
            jQuery("#" + boxLoad).show();
            jQuery("#" + boxLoad).html(html);

            setTimeout(jQuery.unblockUI, 200);

        }
    });
}



function delFileImportUpload(fileAc) {

    jQuery.blockUI({
        message: jQuery('#tallContent'),
        css: {
            border: 'none',
            padding: '35px',
            backgroundColor: '#000',
            '-webkit-border-radius': '10px',
            '-moz-border-radius': '10px',
            opacity: .9,
            color: '#fff'
        }
    });


    var TYPE = "POST";
    var URL = fileAc;

    var dataSet = jQuery("#myForm").serialize();

    jQuery.ajax({
        type: TYPE,
        url: URL,
        data: dataSet,
        success: function (html) {

            jQuery("#boxAlbumNew").show();
            jQuery("#boxAlbumNew").html(html);
            setTimeout(jQuery.unblockUI, 200);

        }
    });
}


function getValueFileShow(valFileInPic, boxInputPics) {
    jQuery("#" + boxInputPics).html(valFileInPic);
}


function cancelWebservicesBooking(fileAc) {

    jQuery.blockUI({
        message: jQuery('#tallContent'),
        css: {
            border: 'none',
            padding: '35px',
            backgroundColor: '#000',
            '-webkit-border-radius': '10px',
            '-moz-border-radius': '10px',
            opacity: .9,
            color: '#fff'
        }
    });

    var TYPE = "POST";
    var URL = "../" + fileAc + "";

    var dataSet = jQuery("#myForm").serialize();
    jQuery.ajax({
        type: TYPE,
        url: URL,
        data: dataSet,
        success: function (html) {

            jQuery("#loadCheckComplete").show();
            jQuery("#loadCheckComplete").html(html);
            setTimeout(jQuery.unblockUI, 200);

        }
    });
}


function changeStatusApprove(fileAc, loadderstatus) {

    jQuery.blockUI({
        message: jQuery('#tallContent'),
        css: {
            border: 'none',
            padding: '35px',
            backgroundColor: '#000',
            '-webkit-border-radius': '10px',
            '-moz-border-radius': '10px',
            opacity: .9,
            color: '#fff'
        }
    });

    var TYPE = "POST";
    var URL = "../" + fileAc + "";
    //alert(URL);
    var dataSet = jQuery("#myFormHome").serialize();

    jQuery.ajax({
        type: TYPE,
        url: URL,
        data: dataSet,
        success: function (html) {

            jQuery("#" + loadderstatus + "").show();
            jQuery("#" + loadderstatus + "").html(html);
            setTimeout(jQuery.unblockUI, 200);
        }
    });
}

function showPartManre() {

    jQuery.blockUI({
        message: jQuery('#tallContent'),
        css: {
            border: 'none',
            padding: '35px',
            backgroundColor: '#000',
            '-webkit-border-radius': '10px',
            '-moz-border-radius': '10px',
            opacity: .9,
            color: '#fff'
        }
    });

    var TYPE = "POST";
    var URL = "loadSelectPart.php";

    var dataSet = jQuery("#myForm").serialize();
    jQuery.ajax({
        type: TYPE,
        url: URL,
        data: dataSet,
        success: function (html) {
            jQuery("#boxPart").show();
            jQuery("#boxPart").html(html);
            setTimeout(jQuery.unblockUI, 200);
        }
    });
}


// ####################################### Start Price ################################################# //
function getPriceCountry(id, fileAc) {

    jQuery.blockUI({
        message: jQuery('#tallContent'),
        css: {
            border: 'none',
            padding: '35px',
            backgroundColor: '#000',
            '-webkit-border-radius': '10px',
            '-moz-border-radius': '10px',
            opacity: .9,
            color: '#fff'
        }
    });
    var TYPE = "POST";
    var URL = "../" + fileAc + "";

    var dataSet = { id: id };
    jQuery.ajax({
        type: TYPE,
        url: URL,
        data: dataSet,
        success: function (html) {
            if (html) {
                jQuery("#loadPriceNew").html(html);
            } else {
                jQuery("#loadPriceNew").html(" - ");
            }
            setTimeout(jQuery.unblockUI, 200);
        }
    });
}

// ####################################### End Price ################################################# //

function number_format(number, decimals, dec_point, thousands_sep) {
    var exponent = "";
    var numberstr = number.toString();
    var eindex = numberstr.indexOf("e");
    if (eindex > -1) {
        exponent = numberstr.substring(eindex);
        number = parseFloat(numberstr.substring(0, eindex));
    }
    if (decimals != null) {
        var temp = Math.pow(10, decimals);
        number = Math.round(number * temp) / temp;
    }
    var sign = number < 0 ? "-" : "";
    var integer = (number > 0 ? Math.floor(number) : Math.abs(Math.ceil(number))).toString();
    var fractional = number.toString().substring(integer.length + sign.length);
    dec_point = dec_point != null ? dec_point : ".";
    fractional = decimals != null && decimals > 0 || fractional.length > 1 ? (dec_point + fractional.substring(1)) : "";
    if (decimals != null && decimals > 0) {
        for (i = fractional.length - 1, z = decimals; i < z; ++i) {
            fractional += "0";
        }
    }
    thousands_sep = (thousands_sep != dec_point || fractional.length == 0) ? thousands_sep : null;
    if (thousands_sep != null && thousands_sep != "") {
        for (i = integer.length - 3; i > 0; i -= 3) {
            integer = integer.substring(0, i) + thousands_sep + integer.substring(i);
        }
    }
    return sign + integer + fractional + exponent;
}

function addonname(typeticket, idticket, type, num = 1) {
    if (type == "new") {

        var html = '<div class="tickets-list ticketId-' + idticket + '">';
        html += '<div class="tickets-list-title">';
        html += 'Name in Ticket - ' + typeticket;
        html += '</div>';
        html += '<hr>';

        html += '<div class="row listPeople-' + idticket + '">';

        html += '<div class="col-md-12 listpeopleadd">';
        html += '<div class="input-group">';
        html += '<input value="" class="form-control" name="ticket[' + idticket + '][nameaddon][]" id="" placeholder="Name" type="text">';
        html += '<div class="input-group-addon">';
        html += '    <i class="fa fa-user faaddon" aria-hidden="true"></i>';
        html += '</div>';
        html += '</div>';
        html += '</div>';

        if (num > 1) {
            html += addonname(typeticket, idticket, "add", num - 1);
        }

        html += ' </div>';
        html += ' </div>';
        html += ' </div>';

    } else {
        var html = "";

        for (var i = 0; i < num; i++) {
            html += '<div class="col-md-12 listpeopleadd">';
            html += '<div class="input-group">';
            html += '<input value="" class="form-control" name="ticket[' + idticket + '][nameaddon][]" id="" placeholder="Name" type="text">';
            html += '<div class="input-group-addon">';
            html += '    <i class="fa fa-user faaddon" aria-hidden="true"></i>';
            html += '</div>';
            html += '</div>';
            html += '</div>';
        }

    }
    return html;
}



function boxContantLoadPlan(fileAc) {
    jQuery("#boxWaittingContant").show();

    var TYPE = "POST";
    var URL = fileAc;

    var dataSet = jQuery("#myForm").serialize();
    jQuery.ajax({
        type: TYPE,
        url: URL,
        data: dataSet,
        success: function (html) {
            jQuery("#boxContantLoadPlan").show();
            jQuery("#boxContantLoadPlan").html(html);
            jQuery("#boxWaittingContant").hide();
        }
    });
}


function boxContantLoadBanner(fileAc) {
    jQuery("#boxWaittingContant").show();

    var TYPE = "POST";
    var URL = fileAc;

    var dataSet = jQuery("#myForm").serialize();
    jQuery.ajax({
        type: TYPE,
        url: URL,
        data: dataSet,
        success: function (html) {
            jQuery("#boxContantLoadBanner").show();
            jQuery("#boxContantLoadBanner").html(html);
            jQuery("#boxWaittingContant").hide();
        }
    });
}

function boxContantLoadContact(fileAc) {
    jQuery("#boxWaittingContant").show();

    var TYPE = "POST";
    var URL = fileAc;

    var dataSet = jQuery("#myForm").serialize();
    jQuery.ajax({
        type: TYPE,
        url: URL,
        data: dataSet,
        success: function (html) {
            jQuery("#boxContantLoadContact").show();
            jQuery("#boxContantLoadContact").html(html);
            jQuery("#boxWaittingContant").hide();
        }
    });
}

//boxContantLoadinfo

function boxContantLoadInfo(fileAc) {
    jQuery("#boxWaittingContant").show();

    var TYPE = "POST";
    var URL = fileAc;

    var dataSet = jQuery("#myForm").serialize();
    jQuery.ajax({
        type: TYPE,
        url: URL,
        data: dataSet,
        success: function (html) {
            jQuery("#boxContantLoadinfo").show();
            jQuery("#boxContantLoadinfo").html(html);
            jQuery("#boxWaittingContant").hide();
        }
    });
}


function changeStatusShow(loaddder, tablename, statusname, statusid, loadderstatus, fileAc) {

    jQuery("#" + loaddder + "").show();

    var TYPE = "POST";
    var URL = fileAc;
    var dataSet = {
        Valueloaddder: loaddder,
        Valuetablename: tablename,
        Valuestatusname: statusname,
        Valuestatusid: statusid,
        Valueloadderstatus: loadderstatus,
        Valuefilestatus: fileAc
    };


    jQuery.ajax({
        type: TYPE,
        url: URL,
        data: dataSet,
        success: function (html) {

            jQuery("#" + loadderstatus + "").show();
            jQuery("#" + loadderstatus + "").html(html)
            jQuery("#" + loaddder + "").hide();
        }
    });
}

function changeStatusBooking(contactid, waitid, groupid) {

    jQuery("#" + waitid + "").show();

    var TYPE = "POST";

    var URL = "../mod_calendar/load_changeGroup.php";
    var dataSet = {
        contactid: contactid,
        groupid: groupid
    };

    jQuery.ajax({
        type: TYPE,
        url: URL,
        data: dataSet,
        success: function (html) {
            jQuery("#errorID").show();
            jQuery("#errorID").html(html);
            jQuery("#" + waitid + "").hide();
        }
    });
}


function loadGroupSelect(gID, masterkey, tID) {
    // alert("cccc");

    jQuery("#loadWaitingCategory").show();

    var TYPE = "POST";
    var URL = "../mod_name/openSelectSub.php";
    var dataSet = {
        gID: gID,
        masterkey: masterkey,
        tID: tID
    };

    jQuery.ajax({
        type: TYPE,
        url: URL,
        data: dataSet,
        success: function (html) {

            jQuery("#loadLevelTypeID").show();
            jQuery("#loadLevelTypeID").html(html)
            jQuery("#loadWaitingCategory").hide();
        }
    });
}



function randomString() {
    var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
    var string_length = 8;
    var randomstring = '';
    for (var i = 0; i < string_length; i++) {
        var rnum = Math.floor(Math.random() * chars.length);
        randomstring += chars.substring(rnum, rnum + 1);
    }
    return randomstring;
}


function insertCommentBlog() {

    jQuery("#loadWaitComment").show();

    var TYPE = "POST";
    var URL = "../mod_blog/blogComment.php";

    var dataSet = jQuery("#myForm").serialize();

    jQuery.ajax({
        type: TYPE,
        url: URL,
        data: dataSet,
        success: function (html) {

            jQuery("#boxMailContact").show();
            jQuery("#boxMailContact").html(html);
            jQuery("#loadWaitComment").hide();

        }
    });
}

//boxMailContact

function loadBoxCommentAll(cID, masterkey) {
    jQuery("#loadWaitComment").show();

    var TYPE = "POST";
    var URL = "../mod_blog/loadComment.php";

    var dataSet = {
        cID: cID,
        masterkey: masterkey
    };

    jQuery.ajax({
        type: TYPE,
        url: URL,
        data: dataSet,
        success: function (html) {

            jQuery("#boxMailContact").show();
            jQuery("#boxMailContact").html(html);
            jQuery("#loadWaitComment").hide();
        }
    });
}


function modDeleteComment(commentid, filehide, qid) {

    jQuery("#loadWaitComment").show();

    var TYPE = "POST";
    var URL = "../mod_blog/deleteComment.php";
    var dataSet = {
        commentid: commentid,
        qid: qid
    };

    jQuery.ajax({
        type: TYPE,
        url: URL,
        data: dataSet,
        success: function (html) {
            jQuery("#" + filehide).hide();
            jQuery("#boxMailContact").show();
            jQuery("#boxMailContact").html(html);
            jQuery("#loadWaitComment").hide();
        }
    });

}



function modDeleteComment1(commentid, filehide, qid) {

    jQuery("#loadWaitComment").show();

    var TYPE = "POST";
    var URL = "../mod_vdoGroup/deleteComment.php";
    var dataSet = {
        commentid: commentid,
        qid: qid
    };

    jQuery.ajax({
        type: TYPE,
        url: URL,
        data: dataSet,
        success: function (html) {
            jQuery("#" + filehide).hide();
            jQuery("#boxMailContact").show();
            jQuery("#boxMailContact").html(html);
            jQuery("#loadWaitComment").hide();
        }
    });

}

function loadBoxCommentAll1(cID, masterkey) {
    jQuery("#loadWaitComment").show();

    var TYPE = "POST";
    var URL = "../mod_vdoGroup/loadComment.php";

    var dataSet = {
        cID: cID,
        masterkey: masterkey
    };

    jQuery.ajax({
        type: TYPE,
        url: URL,
        data: dataSet,
        success: function (html) {

            jQuery("#boxMailContact").show();
            jQuery("#boxMailContact").html(html);
            jQuery("#loadWaitComment").hide();
        }
    });
}

function insertCommentBlog1() {

    jQuery("#loadWaitComment").show();

    var TYPE = "POST";
    var URL = "../mod_vdoGroup/blogComment.php";

    var dataSet = jQuery("#myForm").serialize();

    jQuery.ajax({
        type: TYPE,
        url: URL,
        data: dataSet,
        success: function (html) {

            jQuery("#boxMailContact").show();
            jQuery("#boxMailContact").html(html);
            jQuery("#loadWaitComment").hide();

        }
    });
}



function changeStatusPage(loaddder, tablename, statusname, statusid, loadderstatus, fileAc, idpage) {

    jQuery("#" + loaddder + "").show();

    var TYPE = "POST";
    var URL = fileAc;
    var dataSet = {
        Valueloaddder: loaddder,
        Valuetablename: tablename,
        Valuestatusname: statusname,
        Valuestatusid: statusid,
        Valueloadderstatus: loadderstatus,
        Valuefilestatus: fileAc,
        ValuePageset: idpage,
    };


    jQuery.ajax({
        type: TYPE,
        url: URL,
        data: dataSet,
        success: function (html) {

            jQuery("#" + loadderstatus + "").show();
            jQuery("#" + loadderstatus + "").html(html)
            jQuery("#" + loaddder + "").hide();
        }
    });
}



// pin
function changeDefaultType(loaddder, statusid, tablename, statusname, masterkey, loadderstatus, fileAc, valdiv) {
    jQuery("." + loaddder + "").show();

    var TYPE = "POST";
    var URL = fileAc;
    var dataSet = {
        Valueloaddder: loaddder,
        Valuetablename: tablename,
        Valuestatusname: statusname,
        Valuestatusid: statusid,
        Valueloadderstatus: loadderstatus,
        Valuefilestatus: fileAc,
        Valuemasterkey: masterkey,
        Valuediv: valdiv
    };

    // console.log(dataSet);

    jQuery.ajax({
        type: TYPE,
        url: URL,
        data: dataSet,
        dataType: "json",
        success: function (result) {
            // console.log('test');
            $.each(result, function (i, field) {
                //   list = field.toString().replace(/\\/g, "/");
                // console.log(valdiv + ' ' + i);
                // console.log(field);


                jQuery("#" + valdiv + i + "").show();
                jQuery("#" + valdiv + i + "").html(field);
                //  jQuery("#" + valdiv + i + "").html("test");

                jQuery("." + loaddder + "").hide();
            });


        }
    });
}

function loadpageover(fileAc) {
    document.myFormHome.action = fileAc;
    document.myFormHome.submit();
}

// function directTo(fileAc){
//     $().redirect('fileAc', );
// }
function delPicUpload2(fileAc) {

    jQuery.blockUI({
        message: jQuery('#tallContent'),
        css: {
            border: 'none',
            padding: '35px',
            backgroundColor: '#000',
            '-webkit-border-radius': '10px',
            '-moz-border-radius': '10px',
            opacity: .9,
            color: '#fff'
        }
    });


    var TYPE = "POST";
    var URL = fileAc;

    var dataSet = jQuery("#myForm").serialize();

    jQuery.ajax({
        type: TYPE,
        url: URL,
        data: dataSet,
        success: function (html) {

            jQuery("#boxPicNew2").show();
            jQuery("#boxPicNew2").html(html);
            setTimeout(jQuery.unblockUI, 200);

        }
    });
}

//s add by Draf
function navBarGoto(params = '', value = '') {
    if ($('form#myForm #inputNavBar').length == 0) {
        $('form#myForm').append('<input type="hidden" id="inputNavBar" />')
    }

    $('#inputNavBar').val(value).removeAttr('name').attr('name', params);
    $('form#myForm').submit();
}

function selectParent(fileAc, elemid) {

    jQuery.blockUI({
        message: jQuery('#tallContent'),
        css: {
            border: 'none',
            padding: '35px',
            backgroundColor: '#000',
            '-webkit-border-radius': '10px',
            '-moz-border-radius': '10px',
            opacity: .9,
            color: '#fff'
        }
    });

    var TYPE = "POST";
    var URL = fileAc;

    var dataSet = jQuery("#myForm").serialize();

    jQuery.ajax({
        type: TYPE,
        url: URL,
        data: dataSet,
        success: function (html) {
            jQuery(elemid).show();
            jQuery(elemid).html(html);
            setTimeout(jQuery.unblockUI, 200);

        }
    });
}

$('#inputTier').on('change', function () {
    var point = $(this).find(':selected').data('point');
    $('#tierpoint').show();
    $('#tierpoint').val(point);
});

function urlfriendly(target = '', target2 = '', fileAc) {
    var url = jQuery("#" + target).val();

    // make the url lowercase         
    var encodedUrl = url.toString().toLowerCase();

    // replace & with and           
    encodedUrl = encodedUrl.split(/\&+/).join("-and-")

    // remove invalid characters 
    encodedUrl = encodedUrl.split(/[^a-z0-9ก-๙]/).join("-");

    // remove duplicates 
    encodedUrl = encodedUrl.split(/-+/).join("-");

    // trim leading & trailing characters 
    encodedUrl = encodedUrl.trim('-');

    jQuery("#" + target2).val(encodedUrl);

    var TYPE = "POST";
    var URL = fileAc;

    var dataSet = jQuery("#myForm").serialize();

    jQuery.ajax({
        type: TYPE,
        url: URL,
        data: dataSet,
        success: function (data) {
            data = JSON.parse(data);
            $('#inputUrlcheck').val(data.status);
            $('#urlstatus').html(data.msg);
            $('#urlstatus').css('color', data.color);

        }
    });
}
//e add by Draf



$("#gencode-btn").on("click", function (e) {
    var Prefixcode = $('#inputPrefixcode').val();
    var Codelength = makecode($('#inputCodelength').val());
    if (isBlank(inputPrefixcode)) {
        inputPrefixcode.focus();
        jQuery("#inputPrefixcode").addClass("formInputContantTbAlertY");
        return false;
    } else {
        jQuery("#inputPrefixcode").removeClass("formInputContantTbAlertY");
    }

    // if(isBlank(inputCodelength)){
    //     inputCodelength.focus();
    //     jQuery("#inputCodelength").addClass("formInputContantTbAlertY");
    //     return false;
    // }else{
    //     jQuery("#inputCodelength").removeClass("formInputContantTbAlertY");
    // }

    $('#showCode').html(Prefixcode + '' + Codelength);
});

function makecode(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}


// ##############  List box left right #######################

function listbox_move(listID, direction) {

    var listbox = document.getElementById(listID);
    var selIndex = listbox.selectedIndex;

    if (-1 == selIndex) {
        alert("Please select an option to move.");
        return;
    }

    var increment = -1;
    if (direction == 'up')
        increment = -1;
    else
        increment = 1;

    if ((selIndex + increment) < 0 ||
        (selIndex + increment) > (listbox.options.length - 1)) {
        return;
    }

    var selValue = listbox.options[selIndex].value;
    var selText = listbox.options[selIndex].text;
    var selDatagroup = listbox.options[selIndex].dataset.group;
    listbox.options[selIndex].value = listbox.options[selIndex + increment].value
    listbox.options[selIndex].text = listbox.options[selIndex + increment].text

    listbox.options[selIndex + increment].value = selValue;
    listbox.options[selIndex + increment].text = selText;
    listbox.options[selIndex + increment].dataset.group = selDatagroup;

    listbox.selectedIndex = selIndex + increment;
}

function listbox_moveacross(sourceID, destID) {
    var src = document.getElementById(sourceID);
    var dest = document.getElementById(destID);

    for (var count = 0; count < src.options.length; count++) {

        if (src.options[count].selected == true) {
            var option = src.options[count];

            var newOption = document.createElement("option");
            newOption.value = option.value;
            newOption.text = option.text;
            newOption.dataset.group = option.dataset.group;
            newOption.selected = false;
            try {
                dest.add(newOption, null); //Standard
                src.remove(count, null);
            } catch (error) {
                dest.add(newOption); // IE only
                src.remove(count);
            }
            count--;

        }

    }
    setStyledisplay()
}

function listbox_selectall(listID, isSelect) {

    var listbox = document.getElementById(listID);
    $.each(listbox, function (key, value) {
        if ($(listbox.options[key]).css('display') == 'block') {
            listbox.options[key].selected = isSelect;
        }
    });

}

$(document).on('click', '.cat_option', function (e) {
    var group = $(this).val();
    if (group == "all") {
        $("#productlist option").each(function () {
            $(this).attr('style', 'display:block');
        });
    } else {
        $("#productlist option").each(function () {
            $(this).attr('style', 'display:none');
        });
        $("#productlist option").each(function () {
            var data = $(this).data('group');
            if (data == group) {
                $(this).attr('style', 'display:block');
            } else {
                $(this).css('display', 'none');
            }
        });
    }
})

// $( "#productlist option" ).dblclick(function() {
//     $('#move2right').trigger('click');
// });
// $( "#selectedlist option" ).dblclick(function() {
//     $('#move2left').trigger('click');
// });

function setStyledisplay() {
    var group = $('#catagorybox option:selected').val();
    if (group == "all") {
        $("#productlist option").each(function () {
            $(this).css('display', 'block');
        });
    } else {
        $("#productlist option").each(function () {
            $(this).css('display', 'none');
        });
        $("#productlist option").each(function () {
            var data = $(this).data('group');
            if (data == group) {
                $(this).css('display', 'block');
            } else {
                $(this).css('display', 'none');
            }
        });
    }

}


function RemoveDupicate() {

    $("#selectedlist option").each(function () {
        var value = $(this).val();
        console.log(value);
        $("#productlist").find('option[value=' + value + ']').remove();
        // if($("#productlist").find('option').val() == $(this).val()){
        //     $("#productlist").find('option').val($(this).val()).remove();
        // }
    });

}
