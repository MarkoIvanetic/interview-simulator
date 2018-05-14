'use strict';

/**
 * @ngdoc overview
 * @name njuskaloStanoviApp
 * @description
 * # njuskaloStanoviApp
 *
 * Main module of the application.
 */
angular.module('expressPG', [
        'ngAnimate',
        'ngCookies',
        'ngResource',
        'ngRoute',
        'ngSanitize',
        'ngTouch'
    ])
    .config(function($routeProvider) {
        $routeProvider
            .when('/dashboard', {
                templateUrl: 'app/public/views/main.html',
                controller: 'MainCtrl',
            })
            .when('/login', {
                templateUrl: 'app/public/views/login.html'
            })
            .otherwise({
                redirectTo: '/'
            });
    })
    .run(function($location, $http, SharedService) {
        // Check login
        $http.get('/check')
            .then(function(response) {
                if (!response.data) {
                    $location.path('/login')
                } else {
                    SharedService.user = response.data;
                    console.log(SharedService.user);
                    $location.path('/dashboard');
                }
            }, function(error) {
                console.log('Error: ', error);
            });


    })
    .run(function($rootScope, $location, SharedService) {
        $rootScope.$on('$routeChangeStart', function(event) {
            if (!SharedService.user.username) {
                // event.preventDefault();
                $location.path('/login');
            } else {
                $location.path('/dashboard');
            }
        });
    })