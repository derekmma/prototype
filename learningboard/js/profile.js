define(['util', 'mdls/User', 'temps/BoardBriefTemplate', 'temps/ProfileSubscribeTemplate'], function(util, User, BoardBriefTemplate, ProfileSubscribeTemplate) {
  $(function() {
    if (!/\?\d+/.test(location.search)) {
      alert('User not found');
      location.href = 'index.html';
      return;
    }

    var off = $(".fixed-sidebar-right").offset().top;
    $(".fixed-wrap-inner").css("max-width", $(".fixed-sidebar-right").width());
    $(window).resize(function() {
      off = $(".fixed-sidebar-right").offset().top;
      $(".fixed-wrap-inner").css("max-width", $(".fixed-sidebar-right").width());
    });
    $(window).scroll(function() {
      var scroPos = $(window).scrollTop();
      if (scroPos >= off-78) $(".fixed-sidebar-right").addClass("fixed");
      else $(".fixed-sidebar-right").removeClass("fixed");
    });

    var userId = location.search.match(/\?(\d+)/)[1];
    var queryBoardUrl = User.getId() == userId ? '/lb?user' : '/lb?user=' + userId;
    util.get(queryBoardUrl,
      function(res)
      {
        var data = res.data;
        console.log(res);
        var board_list = data.lb;
        var $board_list_ele = $("#boardList")
        var length = data.lb.length;
        if (length > 0) {
          for (var i = 0; i < length; ++i)
          {
            var board = new BoardBriefTemplate(board_list[i]);
            board.display($("#boardList"));
          }
        } else {
          $("#boardList").append("<p>Could not find any Learning Boards. Create your own one today.</p>");
        }
      }
    );
    var displayUserInfo = function(data) {
      if (data.passports) {
        var key;
        data.passports.some(function(item) {
          if (data.info[item.provider]) {
            key = item.provider;
            return true;
          }
        });
        if (key) {
          switch (key) {
            case 'facebook':
              $('#user_name').text(data.info[key].name || '');
              $('#user_location').text(data.info[key].location ? data.info[key].location.name : '');
              var school;
              if (data.info[key].education) {
                var len = data.info[key].education.length;
                for (var ii = 0; ii < len; ++ii)
                {
                  ele = data.info[key].education[ii];
                  if (ele.type === 'College')
                    school = ele.school.name;
                }
              }
              $('#user_education').text(school || '');
              $('.profile-avatar').attr('src', `https://graph.facebook.com/${data.info[key].id}/picture?height=263&height=263`);
              break;
          }
        } else {
          $('#user_name').text(data.username);
        }
      }
    };

    util.get('/user/' + userId,
      function(res) {
        var data = res.data.user;
        displayUserInfo(data);
        if (data.subscribedlb.length < 1) {
          $("div.subscribinglb").append(`
            <div class="col-sm-12 thumbnail sidebar-item opaque-75">
              <i>He hasn't subscribed any board</i>
            </div>
          `);
        } else {
          data.subscribedlb.map(function(item) {
            var temp = new ProfileSubscribeTemplate(item);
            temp.display($('div.subscribinglb'));
          });
        }
      },
      function() {
        alert('User not found');
        location.href = 'index.html';
        return;
      }
    );
  });
});
