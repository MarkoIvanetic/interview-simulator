'use strict';

angular.module('expressPG')
    .controller('LoginCtrl', function($scope, $http, $q, $timeout, $location, SharedService) {
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

        // Register User
        // ============================================================
        $scope.newUser = {
            email: 'manna@gmail.com',
            username: 'MannaGrad',
            password: '',
            passwordConf: ''
        };
        $scope.resetUserForm = function() {
            $scope.newUser = {
                email: '',
                username: '',
                password: '',
                passwordConf: ''
            };
        };
        $scope.createUser = function(userObj) {
            if (userObj.password !== userObj.passwordConf) {
                console.warn("Something went wrong!");
                return false;
            };

            $http.post('/register', userObj)
                .then(function(response) {

                    $scope.results = response.data;
                    SharedService.user = response.data;
                    console.log(response.data);
                    $location.path('/dashboard');

                }, function(error) {
                    console.log('Error: ', error);
                });
        };
        // Login User
        // ============================================================
        $scope.login = {
            logcredential: 'MannaGrad',
            logpassword: 'trunks'
        };
        $scope.loginUser = function(userObj) {
            if ((!userObj.logcredential && userObj.logpassword)) {
                console.warn("Something went wrong!");
                return false;
            };
            $http.post('/login', userObj)
                .then(function(response) {

                    $scope.results = response.data;
                    SharedService.user = response.data;
                    console.log(response.data);
                    $location.path('/dashboard');

                }, function(error) {
                    console.log('Error: ', error);
                });
        };


    });