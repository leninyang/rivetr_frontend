  // ================================================
  //                HOME PAGE CTRL                 //
  // ================================================

(function(){
  const app = angular.module('Rivetr');

  app.controller('HomeCtrl', ['$http', '$scope', '$rootScope', '$location', '$document', '$routeParams', function($http, $scope, $rootScope, $location, $document, $routeParams){

    // =========== CONTROLLER VARIABLES =============
    const home = this;
    // const URL = 'http://localhost:3000/';
    const URL = 'http://rivetrapi.herokuapp.com/'
    $scope.fullHeader = true;
    $scope.compiledRivs = [];

    // =========== HTTP REQUESTS ====================
    // to post a riv
    this.postRiv = function(id) {
      $http({
        method: 'POST',
        url: URL + 'rivs',
        data: {
          user_id: id,
          content: this.newPostData.content,
          photo: this.newPostData.photo
        }
      }).then(function(response) {
          this.refresh();
          this.newPostData = null;
      }.bind(this))
    }

    // to delete a single riv
    this.deleteOneRiv = function(id) {
      $http({
        method: 'DELETE',
        url: URL + 'rivs/' + id
      }).then(function(response) {
          this.refresh();
      }.bind(this))
    }

    // to delete a single reply
    this.deleteOneReply = function(id) {
      $http({
        method: 'DELETE',
        url: URL + 'replies/' + id
      }).then(function(response) {
          this.refresh();
      }.bind(this))
    }

    // to favorite a riv/reply
    this.favoriteRivReply = function(type, user, riv) {
      switch(type) {
        case 'riv':
          $http({
            method: 'POST',
            url: URL + 'likes',
            data: {
              user_id: user,
              riv_id: riv.riv.id
            }
          }).then(function(response) {
            riv.liked = true;
          })
          break;
        case 'reply':
          $http({
            method: 'POST',
            url: URL + 'likes',
            data: {
              user_id: user,
              reply_id: riv.riv.id
            }
          }).then(function(response) {
              riv.liked = true;
          })
          break;
      }
    }

    // to send a reply
    this.sendReply = function(type, user, riv) {
      switch(type) {
        case 'reply':
          $http({
            method: 'POST',
            url: URL + 'replies',
            data: {
              user_id: user,
              riv_id: riv.riv.id,
              content: home.replyData.content,
              photo: home.replyData.photo
            }
          }).then(function(response) {
              riv.replyBox = false;
              this.refresh();
          }.bind(this));
          break;
        case 'correction':
          $http({
            method: 'POST',
            url: URL + 'replies',
            data: {
              user_id: user,
              riv_id: riv.riv.id,
              content: home.correctionData.content,
              photo: home.correctionData.photo,
              correction: true
            }
          }).then(function(response) {
              riv.correctionBox = false;
              this.refresh();
          });
          break;
      }
    }

    // ========== TIMELINE RIVS ====================
    // toggle riv actions
    this.toggleAction = function(action, riv) {
      switch(action) {
        case 'addPhoto':
          this.addPhotoForm = this.addPhotoForm === true ? false:true;
          break;
        case 'reply':
          riv.replyBox = riv.replyBox === true ? false:true;
          riv.correctionBox = false;
          riv.translationBox = false;
          break;
        case 'correction':
          riv.correctionBox = riv.correctionBox === true ? false:true;
          riv.replyBox = false;
          riv.translationBox = false;
          break;
        case 'translate':
          riv.translationBox = riv.translationBox === true ? false:true;
          riv.replyBox = false;
          riv.correctionBox = false;
          break;
      }
    }

    // ========== ETC. DOM MANIPULATION ============
    // scrolls window back to top
    this.goToTop = function() {
      $document.scrollTop(0, 500);
    }

    // goes to index page
    this.indexPage = function() {
      console.log('index page');
      $location.url('/');
    }

    // ============ LOGOUT AND SESSIONS ============
    // to logout
    this.logout = function(){
      localStorage.clear('token');
      location.reload();
    }

    // checks if session active
    this.sessionCheck = function(){
      if(localStorage.length !== 0){
        let id = localStorage.user;
        $http({
          method: 'GET',
          url: URL + 'users/' + id
        }).then(function(result){
            $rootScope.currentUser = result.data;
            this.compileRivs();
        }.bind(this));
      }
    }

    // compiles the user's followers' rivs
    this.compileRivs = function() {
      // clears previous compilation
      $scope.compiledRivs = [];
      // pushes followed rivs
      $rootScope.currentUser.followed_follows.forEach(function(followed) {
        // regular
        followed.followed.rivs.forEach(function(riv) {
          $scope.compiledRivs.push({'riv': riv, 'user': followed.followed});
        });
        // replies
        followed.followed.replies.forEach(function(reply) {
          $scope.compiledRivs.push({'riv': reply, 'user': followed.followed, 'reply': true});
        });
      });
      // pushes own rivs
      $rootScope.currentUser.rivs.forEach(function(riv) {
        $scope.compiledRivs.push({'riv': riv, 'user': $rootScope.currentUser});
      });
      // pushes own replies
      $rootScope.currentUser.replies.forEach(function(reply) {
        $scope.compiledRivs.push({'riv': reply, 'user': $rootScope.currentUser, 'reply': true});
      });
      this.checkLikes();
    }

    // checks liked rivs
    this.checkLikes = function() {
      $rootScope.currentUser.likes.forEach(function(liked) {
        $scope.compiledRivs.forEach(function(riv) {
          if((!riv.reply) && (liked.riv_id === riv.riv.id)) {
            riv.liked = true;
          } else if ((riv.reply) && (liked.reply_id === riv.riv.id)) {
            riv.liked = true;
          }
        });
      });
    }

    // refreshes data without refreshing page
    this.refresh = function() {
      this.sessionCheck();
    }

    // ============ AUTOMATIC FUNCTION CALLS =======
    this.sessionCheck();

  }]); // ends controller

})(); // ends closure