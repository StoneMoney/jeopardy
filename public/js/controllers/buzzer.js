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
    $scope.fj = {
        wager: false,
        thinking: false
    }
    function unsetLockout(apply) {
        $scope.buzzer.lockout = false;
        if(apply) {
            $scope.$apply();
        }
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

    socket.on('open:wagers', function(data) {
        console.log('open wagers' + data)
        $scope.fj.wager = true;
    })

    socket.on('music:start', function(data) {
        if(data === "yes") {
            $scope.fj.wager = false;
            $scope.fj.thinking = true;
        } else {
            $scope.fj.thinking = false;
            socket.emit("buzzer:fjresponse", $scope.player + " || " + document.getElementById('fjresponse').value)
        }

    })

    function deny(apl) {
        $scope.buzzer.lockout = true;
        if(apl) {
            $scope.$apply();
        }
        $timeout(unsetLockout,300);
    }

    function approve() {
      socket.emit('buzzer:buzzin', $scope.player);
    }

    $scope.wager = function () {
        $scope.fj.wager = false
        socket.emit("buzzer:fjwager", $scope.player + " || " + document.getElementById('fjwager').value)
    }

    $scope.buzzin = function (apl) {
        if($scope.buzzer.status == 'open') {
            approve();
        } else {
            deny(apl);
        }
    }

    document.addEventListener('keydown', logKey);

    function logKey(e) {
        if((e.code == "Space" || e.code == "Enter") && !$scope.buzzer.lockout) {
            $scope.buzzin(true);
        }
    }
  });
