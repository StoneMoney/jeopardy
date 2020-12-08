'use strict';

angular.module('myApp.controllers').
  controller('GameClueCtrl', function ($scope, $modalInstance, response, socket, $timeout) {
    $scope.buzzer = {
      status: "close",
      player: 0,
      player_name: ""
    }
    $scope.category = response.category;
    $scope.clue = response.clue;
    $scope.game = response.game;
    $scope.result = {
      player_1: {},
      player_2: {},
      player_3: {},
      dd_player: response.game.control_player
    };
    $scope.timer = {
      time: 0
    }

    var value = response.id.split('_');
    $scope.result.value = $scope.result.dd_value = parseInt(value[3]) * (value[1] === 'J' ? 200 : 400);

    $scope.setResult = function (num, correct) {
      var key = 'player_' + num;
      $scope.result[key][correct ? 'right' : 'wrong'] = !$scope.result[key][correct ? 'right' : 'wrong'];
      $scope.result[key][correct ? 'wrong' : 'right'] = undefined;

      if ($scope.result[key].right && response.id !== 'clue_FJ') {
        if (num === 1) {
          $scope.result.player_2.right = undefined;
          $scope.result.player_3.right = undefined;
        }
        else if (num === 2) {
          $scope.result.player_1.right = undefined;
          $scope.result.player_3.right = undefined;
        }
        else if (num === 3) {
          $scope.result.player_1.right = undefined;
          $scope.result.player_2.right = undefined;
        }
      }
    };

    socket.on('buzzer:status', function (data) {
      console.log('buzzer:status');
      $scope.buzzer.status = data;
    });

    function subtractTime() {
      $scope.timer.time = ($scope.timer.time-1)
    }
    
    function clearTime() {
        $scope.timer.time = 0;
    }
    socket.on('buzzer:buzzin', function (data) {
      console.log('buzzer:buzzin');
      if($scope.buzzer.status = "open") {
        $scope.buzzer.player = data;
        $scope.buzzer.status = "close";
        socket.emit('buzzer:status', 'close');
        $scope.timer.time = 5;
        $timeout(subtractTime,1000);
        $timeout(subtractTime,2000);
        $timeout(subtractTime,3000);
        $timeout(subtractTime,4000);
        $timeout(subtractTime,5000);
        $timeout(clearTime,6000);
      }
    });

    function runTimeout() {
      if($scope.buzzer.player == 0) {
        $scope.buzzer.status = "timeout";
        socket.emit('buzzer:status', 'timeout');
      }
    }

    $scope.setBuzzerStatus = function (sts) {
      $scope.buzzer.status = sts;
      console.log('e' + $scope.buzzer.status)
      socket.emit('buzzer:status', sts);
      if(sts = "open") {
        $scope.buzzer.player == 0;
        $timeout(runTimeout,5000)
      }
    }

    $scope.setDDValue = function () {
      $scope.result.value = parseInt($scope.result.dd_value);
      $scope.result.dd_confirm = true;
      console.log('clue:daily emit');
      socket.emit('clue:daily', response.id);
    };

    $scope.setDDResult = function (correct) {
      console.log('setDDResult ' + correct);
      $scope.result.dd_result = correct;
    };

    $scope.ok = function () {
      var result = {};
      if ($scope.clue.daily_double) {
        $scope.result[$scope.result.dd_player] = $scope.result[$scope.result.dd_player] || {};
        $scope.result[$scope.result.dd_player][$scope.result.dd_result ? 'right' : 'wrong'] = true;
      }
      result[response.id] = $scope.result;
      $modalInstance.close(result);
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  });
