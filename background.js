chrome.runtime.onInstalled.addListener(() => {
    chrome.alarms.get('periodic', a => {
        if (!a) chrome.alarms.create('periodic', { periodInMinutes: 5.0 });
    });
    chrome.tabs.onUpdated.addListener(listener);
});

chrome.alarms.onAlarm.addListener(() => {
    var time = new Date();
    console.log('Tick [' + time.getHours() + ':' + time.getMinutes() + ':' + time.getSeconds() + ']');
    chrome.tabs.create({ 'url': `https://darman.tamin.ir/Forms/DrugStore/ApplyPrescDrugMelki_1P.aspx?pagename=hdpApplyPrescDrugMelki_1P`, active: false }, function (tab) {
        console.log('Open');
        function listener(id, changeInfo, tab) {
            if (id === tab.id && changeInfo.status == 'complete') {
                setTimeout(function () {
                    chrome.tabs.remove(tab.id);
                    chrome.tabs.onUpdated.removeListener(listener);
                    console.log('close');
                }, 5000);
            }
        };
        chrome.tabs.onUpdated.addListener(listener);
    });
});