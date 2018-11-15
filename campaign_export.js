var fs = require('fs');
var Json2csvParser = require('json2csv').Parser;


var auth_header = 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6MzQzMiwic2Vzc2lvbl9pZCI6NTMxNzEsInV1aWQiOiI0ODM0MWQ0MC03MmVkLTExZTctOGYwMS0xZGVjYTYyYzQ0NTAiLCJzY29wZSI6InJlYWQuaW5mbHVlbmNlci1wcm9maWxlcyByZWFkLmNhbXBhaWduIGFkbWluIiwiaWF0IjoxNTQyMjA3MjE2LCJleHAiOjE1NDIyOTM2MTZ9.PzGe_5sZAc7xmkQkeNUm1tiHnSV_4Z4KoaDhMwRPgVk'
const request = require('request-promise')
const options = {
    json: true,
    headers: {
        Authorization: auth_header,
        'Content-Type': 'application/json'
    }
};


var fields = ['CAMPAIGN_ID','CAMPAIGN_NAME', 'CAMPAIGN_START_DATE', 'CAMPAIGN_END_DATE', 'TOTAL_CONTENT_CREATOR_INVEST', 'TOTAL_IMPRESSIONS', 'CPM', 'TOTAL_REACH', 'FOLLOWERS_DURING_THE_CAMPAIGN', 'TOTAL_REACTIONS', 'COST_PER_REACTION', 'ENGAGEMENT_RATE', 'EARNED_MEDIA_VALUE', 'ROI', 'ROI_P'];
var json2csvParser = new Json2csvParser({fields});

const roundNumber = (val) =>{
    return Number(val.toFixed(3))
}

var campaingIds = [144, 453];
const main = async() =>
{

    for (var item in campaingIds) {
        try {
            const report = await request('http://localhost:8000/campaigns/' + campaingIds[item] + '/report', options);
            const overview = await request('http://localhost:8000/campaigns/' + campaingIds[item] + '/overview', options);
            const campaign = await request('http://localhost:8000/campaigns/' + campaingIds[item], options);

            var output = {};

            output.CAMPAIGN_ID = campaingIds[item];
            output.CAMPAIGN_NAME = campaign.name;
            output.CAMPAIGN_START_DATE = campaign.start_date;
            output.CAMPAIGN_END_DATE = campaign.end_date;
            output.TOTAL_CONTENT_CREATOR_INVEST = overview.accepted_overview.budget;
            output.TOTAL_IMPRESSIONS = roundNumber(report.metrics.instagram.stories_impressions + report.metrics.instagram.impressions);
            output.CPM = roundNumber(report.metrics.instagram.cost_per_mille);
            output.TOTAL_REACH = roundNumber(report.metrics.instagram.stories_reach + report.metrics.instagram.reach);
            output.FOLLOWERS_DURING_THE_CAMPAIGN = roundNumber(report.metrics.instagram.followers);
            output.TOTAL_REACTIONS = roundNumber(report.metrics.instagram.reactions);
            output.COST_PER_REACTION = roundNumber(report.metrics.instagram.cost_per_reaction);
            output.ENGAGEMENT_RATE = roundNumber(report.metrics.instagram.engagement_rate);
            output.EARNED_MEDIA_VALUE = roundNumber(report.metrics.instagram.stories_media_value + report.metrics.instagram.media_value);
            output.ROI = roundNumber(report.metrics.instagram.roi);
            output.ROI_P = roundNumber(output.EARNED_MEDIA_VALUE / output.TOTAL_CONTENT_CREATOR_INVEST);

            var out = json2csvParser.parse(output);
            var csv = out.substring(out.indexOf("\n"));
            fs.appendFile('out.csv', csv, 'utf8',
                // callback function
                function (err) {
                    if (err) {
                        console.log(csv)
                    }
                });
        }
        catch (error) {
            console.error(campaingIds[item]);
        }
    }

}
;

main();
