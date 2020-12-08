'use strict';

angular.module('myApp.controllers').
  controller('BuzzerCtrl', function ($scope, socket, $stateParams, $timeout) {
    $scope.buzzer = {
        status: 'close',
        player: 0,
        lockout: false
    }
    $scope.player = $stateParams.id;
    $scope.timer = {
        status: false,
        time: 0
    }

    function unsetLockout() {
        $scope.buzzer.lockout = false;
    }

    function subtractTime() {
        $scope.timer.time = ($scope.timer.time-1)
    }
    
    function clearTime() {
        $scope.timer.status = false;
        $scope.timer.time = 0;
    }

    socket.on('buzzer:status', function (data) {
        console.log('buzzer:status');
        $scope.buzzer.status = data;
    });

    socket.on('buzzer:buzzin', function (data) {
        console.log("OMG")
        if(data == $scope.player) {
            $scope.timer.status = true;
            $scope.timer.time = 5;
            $timeout(subtractTime,1000);
            $timeout(subtractTime,2000);
            $timeout(subtractTime,3000);
            $timeout(subtractTime,4000);
            $timeout(subtractTime,5000);
            $timeout(clearTime,6000);
        }
        $scope.buzzer.status = data;
    });

    $scope.deny = function () {
        $scope.buzzer.lockout = true;
        $timeout(unsetLockout,300);
    }

    $scope.buzzin = function () {
      socket.emit('buzzer:buzzin', $scope.player);
    }

  });
