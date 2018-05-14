'use strict';

angular.module('expressPG')
    .controller('MainCtrl', function($scope, $http, $q, $timeout, SharedService) {
        $scope.data = [];
        $scope.$http = $http;
        $scope.SharedService = SharedService;

        // Check login
        $http.get('/check')
            .then(function(response) {
                if (!response) {

                } else {
                    SharedService.user = response.data;
                    console.log(SharedService.user);
                }
            }, function(error) {
                console.log('Error: ', error);
            });


        $scope.getBears = function() {
            $http.get('/api/bears')
                .then(function(response) {
                    $scope.data = response.data;
                    console.log(response.data);
                }, function(error) {
                    console.log('Error: ', error);
                });

        };

        // $http.post('/someUrl', data, config).then(successCallback, errorCallback);

        $scope.postQuestion = function(question) {
            $http.post('/api/questions', {'question':question})
                .then(function(response) {
                    $scope.data = response.data;
                    console.log(response.data);
                }, function(error) {
                    console.log('Error: ', error);
                });

        };

        $scope.getCrypto = function() {
            $http.get('/api/questions')
                .then(function(response) {
                    $scope.results = response.data;
                    console.log(response.data);
                }, function(error) {
                    console.log('Error: ', error);
                });

        };
        $scope.results = '';
        $scope.bearSearch = '';

        $scope.findBear = function(bearId) {
            $http.get('/api/bears/' + bearId)
                .then(function(response) {
                    $scope.results = response.data;
                    console.log(response.data);
                }, function(error) {
                    console.log('Error: ', error);
                });
        };

    });

    