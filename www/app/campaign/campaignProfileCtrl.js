angular.module('app').controller('campaignProfileCtrl', function($scope, $http, $stateParams, $state, $ionicHistory, Campaign, AuthService, apiCall) {

  $scope.campaign = Campaign.selectedCampaign;
  $scope.gotDetails = false;

  $scope.donated = '';
  $scope.apiCall = apiCall.call;
  $scope.linkApiCalls = apiCall.linkApiCalls;
  $scope.obj = apiCall.obj;

  $scope.isOwner = function(){
    return $scope.ownerId === AuthService.getCurrentUser()._id;
  };

  $scope.getCampaign = function(){
    $scope.id = $stateParams.id;

    Campaign.getCampaigns($scope.id).then(function(data){
      $scope.campaign = data;
      if ($scope.campaign.user_id) {
        $scope.ownerId = $scope.campaign.user_id._id;
      }
      $scope.loaded = true;
      $scope.$broadcast('scroll.refreshComplete');
      return data;
    }).then(function(data){
      //get additional campaign data
      if ($scope.gotDetails === false && data) {
        $scope.getCampaignDetails(data);
      }
    });
    
  };

  $scope.followCampaign = function(campaign){
    Campaign.followCampaign(campaign)
      .success(function(data){
        //sync follow status
        console.log('sync',data);
        if (data._id){
          campaign.follower_id = data._id;
          campaign.following = true;
        } else {
          campaign.following = false;
        }
      });
    campaign.following = !campaign.following;
  };

  $scope.getCampaignDetails = function(campaign){
    $scope.gotDetails = true;

    var links = campaign._links.slice(1);
    apiCall.apiExtend(campaign, links, function(){
      
      //determine if following campaign
      var currentUserId = AuthService.getCurrentUser()._id;
      $scope.campaign.following = campaign.followers.some(function(follower){
         campaign.follower_id = follower._id;
         return follower.user_id === currentUserId; 
      });
      console.log('follow id', campaign.follower_id)

      //get total of donations
      var amounts = _.pluck(campaign.contributors, 'amount');
      campaign.donated = _.reduce(amounts, function(total, n) {
        return total + n;
      }, 0);
      console.log($scope.campaign)
    });

  };

  $scope.deleteCampaign = function(){
    //add an "are you sure" popup
    Campaign.deleteCampaign($scope.id);
    //TODO: fix refresh after campaign deletion
    $state.go($ionicHistory.backView().stateName, {}, {reload: true});
  };

  $scope.getCampaign();




});