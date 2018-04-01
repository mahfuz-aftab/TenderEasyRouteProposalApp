var app = angular.module('TenderEasyRouteProposalApp', ['ngRoute']);

app.config(function($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'templates/login.html',
      controller: 'LoginController'
    })
    .when('/dashboard', {
      templateUrl: 'templates/dashboard.html',
      controller: 'FreightController'
    })
});

app.service('UserInfoService', function() {
  var UserInfo = {
    name: 'Toni Kroos',
    username: 'kroos',
    email: 'kroos@tendereasy.com',
    password: 'kroos123456',
    userLevel: 'Regular',
    memberSince: 'July 07, 2016'
  };
  return UserInfo;
});

// This is your controller.

app.controller("LoginController", function($scope, $location, UserInfoService) {
  $scope.credentialsWarning = false;
  $scope.credentialsChecking = function(username, password) {
    if (username == UserInfoService.username && password == UserInfoService.password) {
      $location.path('/dashboard');
      $scope.credentialsWarning = false;
    } else {
      $location.path('/');
      $scope.credentialsWarning = true;
    }
  }
});

app.controller("FreightController", function($scope, UserInfoService) {


  $scope.UserInfo = UserInfoService;

  $scope.freightShipmentData = [{
      cityFrom: 'Stockholm',
      cityTo: 'Gothenburg',
      from: [59.347553, 18.069915],
      to: [57.72929, 11.974831],
      transportModel: 'Road',
      durationInDays: 1,
      containerSizeMin: 40,
      containerSizeMax: 60,
      costMin: 430,
      costMax: 630
    },
    {
      cityFrom: 'Gothenburg',
      cityTo: 'Ft. Lauderdale',
      from: [57.72929, 11.974831],
      to: [26.127534, -80.134927],
      transportModel: 'Ocean',
      durationInDays: 22,
      containerSizeMin: 40,
      containerSizeMax: 60,
      costMin: 1623,
      costMax: 2500
    },
    {
      cityFrom: 'Ft. Lauderdale',
      cityTo: 'Orlando',
      from: [26.127534, -80.134927],
      to: [28.537212, -81.384556],
      transportModel: 'Road',
      durationInDays: 1,
      containerSizeMin: 40,
      containerSizeMax: 60,
      costMin: 600,
      costMax: 900
    },
    {
      cityFrom: 'Gothenburg',
      cityTo: 'Savannah',
      from: [57.72929, 11.974831],
      to: [32.081829, -81.1021],
      transportModel: 'Ocean',
      durationInDays: 23,
      containerSizeMin: 40,
      containerSizeMax: 60,
      costMin: 1765,
      costMax: 2600
    },
    {
      cityFrom: 'Savannah',
      cityTo: 'Orlando',
      from: [32.081829, -81.1021],
      to: [28.537212, -81.384556],
      transportModel: 'Road',
      durationInDays: 1,
      containerSizeMin: 40,
      containerSizeMax: 60,
      costMin: 600,
      costMax: 900
    },
    {
      cityFrom: 'Stockholm',
      cityTo: 'Rotterdam',
      from: [59.347553, 18.069915],
      to: [51.922384, 4.484904],
      transportModel: 'Road',
      durationInDays: 3,
      containerSizeMin: 40,
      containerSizeMax: 60,
      costMin: 1430,
      costMax: 2600
    },
    {
      cityFrom: 'Rotterdam',
      cityTo: 'Ft. Lauderdale',
      from: [51.922384, 4.484904],
      to: [26.127534, -80.134927],
      transportModel: 'Ocean',
      durationInDays: 18,
      containerSizeMin: 40,
      containerSizeMax: 60,
      costMin: 1623,
      costMax: 2600
    }
  ];

  $scope.cities = ['Stockholm', 'Gothenburg', 'Ft. Lauderdale', 'Savannah', 'Orlando', 'Rotterdam'];
  $scope.unitSizeOptions = [40, 60];
  $scope.termOptions = ["CIF", "FOB"]
  $scope.searchResultDiv = false;

  $scope.completeFrom = function(string) {
    $scope.hidethisFrom = false;

    var output = [];
    angular.forEach($scope.cities, function(city) {
      if (city.toLowerCase().indexOf(string.toLowerCase()) >= 0) {
        output.push(city);
      }
    });
    $scope.filterCity = output;
  }

  $scope.completeTo = function(string) {
    $scope.hidethisTo = false;

    var output = [];
    angular.forEach($scope.cities, function(city) {
      if (city.toLowerCase().indexOf(string.toLowerCase()) >= 0) {
        output.push(city);
      }
    });
    $scope.filterCity = output;
  }

  $scope.fillTextboxFrom = function(citydataFrom) {
    $scope.cityFrom = citydataFrom;
    $scope.hidethisFrom = true;
  }

  $scope.fillTextboxTo = function(citydataTo) {
    $scope.cityTo = citydataTo;
    $scope.hidethisTo = true;
  }

  $scope.find = function(cityTo) {
    $scope.viewCityTo = cityTo;

    var getAllSource = function(destId) {
      var sourceForsameDist = [];
      $scope.pathDirection.forEach(function(eachDirection) {
        if (eachDirection.Destination == destId) {
          sourceForsameDist.push(eachDirection.Source);
        }
      });
      return sourceForsameDist;
    };

    var diffPath = [];

    var getDestination = function(destination) {
      var sourceId = getAllSource(destination[destination.length - 1]);
      if (sourceId.length === 0) {
        diffPath.push(destination);
      }
      for (var i = 0; i < sourceId.length; i++) {
        var copy = destination.slice(0);
        copy.push(sourceId[i]);
        getDestination(copy);
      }

    };

    getDestination([cityTo]);
    return diffPath;
  };

  $scope.pathOptions = [];
  $scope.pathDirection = [];
  $scope.routePrice = {};
  var breakDownArr = [];

  $scope.queryInput = function(unit, cityFrom, cityTo, term) {
    $scope.searchResultDiv = true;
    $scope.termOpt = term;
    angular.forEach($scope.freightShipmentData, function(v, i) {
      $scope.routePrice[v.cityFrom + "__" + v.cityTo] = v;
      $scope.pathDirection.push({
        "Source": v.cityFrom,
        "Destination": v.cityTo
      });
    });

    var cfrom = cityFrom;
    var _possible_paths = $scope.find(cityTo);

    angular.forEach(_possible_paths, function(v, i) {
      v = v.reverse();

      if (v.indexOf(cfrom) !== -1) {

        var _index = v.indexOf(cfrom);

        if ($scope.pathOptions[i] == undefined) {
          $scope.pathOptions[i] = [];
          $scope.pathOptions[i]['path'] = '';
          $scope.pathOptions[i]['breakDown'] = [];
        }

        var _pathOptions = [];

        while (_index < v.length - 1) {
          _pathOptions.push(v[_index]);

          var pIndex = v[_index] + "__" + v[_index + 1];

          var _breakDownMax = {
            from: v[_index],
            to: v[_index + 1],
            unitShipment: $scope.routePrice[pIndex].containerSizeMax,
            expenseShipment: $scope.routePrice[pIndex].costMax,
            durationShipment: $scope.routePrice[pIndex].durationInDays,
            object: $scope.routePrice[pIndex]
          };

          var _breakDownMin = {
            from: v[_index],
            to: v[_index + 1],
            unitShipment: $scope.routePrice[pIndex].containerSizeMin,
            expenseShipment: $scope.routePrice[pIndex].costMin,
            durationShipment: $scope.routePrice[pIndex].durationInDays,
            object: $scope.routePrice[pIndex]
          };

          if (unit == "40") {
            $scope.pathOptions[i]['breakDown'].push(_breakDownMin);
            _index++;
          } else {
            $scope.pathOptions[i]['breakDown'].push(_breakDownMax);
            _index++;
          }
        }
        $scope.pathOptions[i]['path'] = _pathOptions.join(" - ");

        var costTotal = 0;
        var daysTotal = 0;

        for (var k in $scope.pathOptions[i]['breakDown']) {

          costTotal += $scope.pathOptions[i]['breakDown'][k].expenseShipment;
          daysTotal += $scope.pathOptions[i]['breakDown'][k].durationShipment;

          if (k == $scope.pathOptions[i]['breakDown'].length - 1) {
            $scope.pathOptions[i]['breakDown'].push({
              "costTotal": costTotal,
              "daysTotal": daysTotal
            });
          }
        }
        breakDownArr = $scope.pathOptions[i]['breakDown'];
      }
    });
    myMap();
  };

  function myMap() {

    var map = new google.maps.Map(document.getElementById('map'), {
      zoom: 3,
      center: {
        lat: 0,
        lng: -120
      },
      mapTypeId: 'terrain'
    });

    var lat = 0,
      lng = 0;
    var pathCoordinates = [];

    for (var z = 0; z < breakDownArr.length; z++) {
      lat = breakDownArr[z].object.from[0];
      lng = breakDownArr[z].object.from[1];

      lat = breakDownArr[z].object.to[0];
      lng = breakDownArr[z].object.to[1];

      console.log("lat: ", lat);
      console.log("lng: ", lng);
      pathCoordinates.push({
        "lat": lat,
        "lng": lng
      });
      console.log("Arr: ", pathCoordinates);
    }

    // var pathCoordinates = [
    //        {lat: 59.347553, lng: 18.069915},
    //        {lat: 57.72929, lng: 11.974831},
    //        {lat: 26.127534, lng: -80.134927},
    //        {lat: 28.537212, lng: -81.384556}
    //      ];

    var pathsMap = new google.maps.Polyline({
      path: pathCoordinates,
      geodesic: true,
      strokeColor: '#FF0000',
      strokeOpacity: 1.0,
      strokeWeight: 2
    });

    pathsMap.setMap(map);

  }

});
