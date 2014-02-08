$(document).ready(function($) {
  $(".tweet").tweet({
    username: "",
    query: "from%3Atableau+OR+%40tableau+OR+%23tableau+OR+%23tableaupublic",
    avatar_size: 32,
    count: 3,
    loading_text: "loading tweets..."
  });
  
  $('#block-tab_twitter-0').show();
});