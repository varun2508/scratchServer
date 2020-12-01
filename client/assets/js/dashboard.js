const logout = () => {
  console.log("----------logout callerd");
  localStorage.removeItem("token");
  window.location.replace("https://scratchandwin.herokuapp.com/index.html");
};

$().ready(function () {
  $sidebar = $(".sidebar");
  $sidebar_img_container = $sidebar.find(".sidebar-background");

  $full_page = $(".full-page");

  $sidebar_responsive = $("body > .navbar-collapse");

  window_width = $(window).width();

  fixed_plugin_open = $(".sidebar .sidebar-wrapper .nav li.active a p").html();

  if (window_width > 767 && fixed_plugin_open == "Dashboard") {
    if ($(".fixed-plugin .dropdown").hasClass("show-dropdown")) {
      $(".fixed-plugin .dropdown").addClass("show");
    }
  }

  $(".fixed-plugin a").click(function (event) {
    // Alex if we click on switch, stop propagation of the event, so the dropdown will not be hide, otherwise we set the  section active
    if ($(this).hasClass("switch-trigger")) {
      if (event.stopPropagation) {
        event.stopPropagation();
      } else if (window.event) {
        window.event.cancelBubble = true;
      }
    }
  });

  $(".fixed-plugin .background-color span").click(function () {
    $(this).siblings().removeClass("active");
    $(this).addClass("active");

    var new_color = $(this).data("color");

    if ($sidebar.length != 0) {
      $sidebar.attr("data-color", new_color);
    }

    if ($full_page.length != 0) {
      $full_page.attr("filter-color", new_color);
    }

    if ($sidebar_responsive.length != 0) {
      $sidebar_responsive.attr("data-color", new_color);
    }
  });

  $(".fixed-plugin .img-holder").click(function () {
    $full_page_background = $(".full-page-background");

    $(this).parent("li").siblings().removeClass("active");
    $(this).parent("li").addClass("active");

    var new_image = $(this).find("img").attr("src");

    if (
      $sidebar_img_container.length != 0 &&
      $(".switch-sidebar-image input:checked").length != 0
    ) {
      $sidebar_img_container.fadeOut("fast", function () {
        $sidebar_img_container.css(
          "background-image",
          'url("' + new_image + '")'
        );
        $sidebar_img_container.fadeIn("fast");
      });
    }

    if (
      $full_page_background.length != 0 &&
      $(".switch-sidebar-image input:checked").length != 0
    ) {
      var new_image_full_page = $(".fixed-plugin li.active .img-holder")
        .find("img")
        .data("src");

      $full_page_background.fadeOut("fast", function () {
        $full_page_background.css(
          "background-image",
          'url("' + new_image_full_page + '")'
        );
        $full_page_background.fadeIn("fast");
      });
    }

    if ($(".switch-sidebar-image input:checked").length == 0) {
      var new_image = $(".fixed-plugin li.active .img-holder")
        .find("img")
        .attr("src");
      var new_image_full_page = $(".fixed-plugin li.active .img-holder")
        .find("img")
        .data("src");

      $sidebar_img_container.css(
        "background-image",
        'url("' + new_image + '")'
      );
      $full_page_background.css(
        "background-image",
        'url("' + new_image_full_page + '")'
      );
    }

    if ($sidebar_responsive.length != 0) {
      $sidebar_responsive.css("background-image", 'url("' + new_image + '")');
    }
  });

  $(".switch input").on("switchChange.bootstrapSwitch", function () {
    $full_page_background = $(".full-page-background");

    $input = $(this);

    if ($input.is(":checked")) {
      if ($sidebar_img_container.length != 0) {
        $sidebar_img_container.fadeIn("fast");
        $sidebar.attr("data-image", "#");
      }

      if ($full_page_background.length != 0) {
        $full_page_background.fadeIn("fast");
        $full_page.attr("data-image", "#");
      }

      background_image = true;
    } else {
      if ($sidebar_img_container.length != 0) {
        $sidebar.removeAttr("data-image");
        $sidebar_img_container.fadeOut("fast");
      }

      if ($full_page_background.length != 0) {
        $full_page.removeAttr("data-image", "#");
        $full_page_background.fadeOut("fast");
      }

      background_image = false;
    }
  });
});

type = ["primary", "info", "success", "warning", "danger"];

demo = {
  initPickColor: function () {
    $(".pick-class-label").click(function () {
      var new_class = $(this).attr("new-class");
      var old_class = $("#display-buttons").attr("data-class");
      var display_div = $("#display-buttons");
      if (display_div.length) {
        var display_buttons = display_div.find(".btn");
        display_buttons.removeClass(old_class);
        display_buttons.addClass(new_class);
        display_div.attr("data-class", new_class);
      }
    });
  },

  initDocumentationCharts: function () {
    /* ----------==========     Daily Sales Chart initialization For Documentation    ==========---------- */

    dataDailySalesChart = {
      labels: ["M", "T", "W", "T", "F", "S", "S"],
      series: [[12, 17, 7, 17, 23, 18, 38]],
    };

    optionsDailySalesChart = {
      lineSmooth: Chartist.Interpolation.cardinal({
        tension: 0,
      }),
      low: 0,
      high: 50, // creative tim: we recommend you to set the high sa the biggest value + something for a better look
      chartPadding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
    };

    var dailySalesChart = new Chartist.Line(
      "#dailySalesChart",
      dataDailySalesChart,
      optionsDailySalesChart
    );

    // lbd.startAnimationForLineChart(dailySalesChart);
  },

  initDashboardPageCharts: async function () {
    const getGeneralStats = async () => {
      console.log("-----getting general-----");
      const fetchOption = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      };
      const URL = `https://scratchandwin.herokuapp.com/api/GeneralStats`;
      return fetch(URL, fetchOption)
        .then(async (response) => {
          const stats = await response.json();
          console.log("----------generalStats", stats);
          return stats;
        })
        .catch(() => {
          console.log("----------error generalStats");
          return new Error("Error on generalStats");
        });
    };

    const results = await getGeneralStats();
    const winsPercent = (results[0].wins * 100) / results[0].totalGamesPlayed;
    const loosesPercent =
      (results[0].losses * 100) / results[0].totalGamesPlayed;
    const gamesWon = results[0].wins;
    const gamesLost = results[0].losses;

    document.getElementById("totalGamesPlayed").innerHTML =
      results[0].totalGamesPlayed;
    document.getElementById("amountWon").innerHTML = results[0].amountWon;
    document.getElementById("amountLoosed").innerHTML = results[0].amountLoosed;

    var dataPreferences = {
      series: [[25, 30, 20, 25]],
    };

    var optionsPreferences = {
      donut: true,
      donutWidth: 40,
      startAngle: 0,
      total: 100,
      showLabel: false,
      axisX: {
        showGrid: false,
      },
    };

    Chartist.Pie("#chartPreferences", dataPreferences, optionsPreferences);

    Chartist.Pie("#chartPreferences", {
      labels: [
        `${winsPercent.toFixed(2)}% (${gamesWon})`,
        `${loosesPercent.toFixed(2)}% (${gamesLost})`,
      ],
      series: [winsPercent.toFixed(2), loosesPercent.toFixed(2)],
    });
    // document.getElementById("generalStats").style.display = "none";
    const createTable = async function () {
      console.log("----------calling table funcitn");
      var table = document.getElementById("winningHistoryTbody");

      const getHistory = async () => {
        console.log("-----getting history-----");
        const fetchOption = {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        };
        const URL = `https://scratchandwin.herokuapp.com/api/WinHistories`;
        return fetch(URL, fetchOption)
          .then(async (response) => {
            const stats = await response.json();
            console.log("----------winhistoru", stats);
            return stats;
          })
          .catch(() => {
            console.log("----------error winhistoru");
            return new Error("Error on generalStats");
          });
      };
      const data = await getHistory();
      console.log("----------data", data);
      document.getElementById("generalStats").style.display = "block";
      document.getElementById("loader").style.display = "none";
      for (let index = data.length - 1; index >= 0; index--) {
        const element = data[index];
        var row = table.insertRow(0);
        var cell0 = row.insertCell(0);
        var cell1 = row.insertCell(1);
        var cell2 = row.insertCell(2);
        var cell3 = row.insertCell(3);
        var cell4 = row.insertCell(4);
        var cell5 = row.insertCell(5);
        var cell6 = row.insertCell(6);

        cell0.innerHTML = `${index + 1}`;
        cell1.innerHTML = `${element.gameName}`;
        cell2.innerHTML = `${element.date}`;
        cell3.innerHTML = `${element.win ? "won" : "lost"}`;
        cell4.innerHTML = `${element.amount}`;
        cell5.innerHTML = `${element.userId}`;
        cell6.innerHTML = `${element.firstName || ""} ${
          element.lastName || ""
        }`;
      }
    };

    createTable();
  },
};
