import { Component, OnInit,ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { UserService } from '../user/user.service';
import { PostService } from '../post/post.service';

// import { NguiMapModule} from '@ngui/map';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})

export class PostComponent implements OnInit {
  private loggedInUser;
  posts = [];
  private post;
  private title = "";
  private description="";
  private image_url;
  private mapInstance;
  private tempLat = 37.76;
  private tempLng= -122.418;
  private lastInfoWindow;
  private helperInfoWindow;
  private inputPlace;
  private lastMarker;
  private editable;

  constructor(
    private userService: UserService,
    private postService: PostService,
  ) { }

  ngOnInit() {
    this.postService.getAllPosts()
    .subscribe(res=>{
      this.posts = res.json();
      this.posts.push(
        {
          place: {
            geometry: {
              location: {
                lat: 37.7694208,
                lng: -122.48621379999997,
              }
            }
          },
          title: "Hello HA",
          image_url: "https://lh3.googleusercontent.com/ez8pDFoxU2ZqDmyfeIjIba6dWisd8MY_6choHhZNpO0WwLhICu0v0s5eV2WHOhuhKw=w170",

        },
        {
          place: {
            geometry: {
              location: {
                lat: 37.7988737,
                lng: -122.46619370000002,
              }
            }
          },
          title: "What chu looking at?",
          image_url: "http://icons.iconarchive.com/icons/martin-berube/flat-animal/256/frog-icon.png",
        },
        {
          place: {
            geometry: {
              location: {
                lat: 37.8060532,
                lng: -122.41033110000001,
              }
            }
          },
          title: "A nice day to fish some fishy",
          image_url: "https://images-na.ssl-images-amazon.com/images/I/41f4HriR3lL.png",
        }
      )
    })

    this.loggedInUser = {
      _id: "59f55ea0fdd13e0a6cf66077",
      username: "asd",
      password: "123",
    }


    console.log(this.posts);
  }

  onMapReady(map) {
    console.log('posts', map.posts);  // to get all posts as an array
    this.mapInstance = map;
    this.addCloseInfoWindowOnMapClickEvent();
    var input = <HTMLInputElement>(document.getElementById('geoSearch'));
    var autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo('bounds', map);

    var infowindow = new google.maps.InfoWindow();
    this.helperInfoWindow = infowindow;
    var infowindowContent = document.getElementById('infowindow-content');
    infowindow.setContent(infowindowContent);

    // For directing location after inputted a location.
    let helperMarker = this.createNewMarker();

    autocomplete.addListener('place_changed', ()=> {
      infowindow.close();
      helperMarker.setVisible(false);
      var place = autocomplete.getPlace();
      this.inputPlace = place;
      if (!place.geometry) {
        window.alert("No details available for input: '" + place.name + "'"); return;
      }
      // If the place has a geometry, then present it on a map.
      if (place.geometry.viewport) {
        map.fitBounds(place.geometry.viewport);
      } else {
        map.setCenter(place.geometry.location);
        map.setZoom(20);  // Why 17? Because it looks good.
      }
      helperMarker.setPosition(place.geometry.location);

      var address = '';
      if (place.address_components) {
        address = this.formatAddress(place.address_components);
      }

      infowindowContent.children['place-icon'].src = place.icon;
      infowindowContent.children['place-name'].textContent = place.name;
      infowindowContent.children['place-address'].textContent = address;
      infowindow.open(map, helperMarker);
    });
  }

  onMarkerInit(marker,title,image_url) {
    var markerInfoWindow = new google.maps.InfoWindow({
      content: '<div class="icon">' +
      title + '</div>' +
      '<div>' + '<input type="text"> <button type="button">click me</button>' + '</div>'
    });
    if(image_url){
      marker.setIcon({
        url: image_url,
        scaledSize: new google.maps.Size(40, 40),
      });
    }
    marker.addListener('click', ()=> {
      if(this.lastMarker === undefined || this.lastMarker === marker){
        marker.setAnimation(google.maps.Animation.BOUNCE);
        this.lastMarker = marker;
      }else if(this.lastMarker !== marker){
        this.lastMarker.setAnimation(null);
        marker.setAnimation(google.maps.Animation.BOUNCE);
        this.lastMarker = marker;
      }

      if(this.lastInfoWindow === undefined){
        this.lastInfoWindow = markerInfoWindow;
        markerInfoWindow.open(this.mapInstance, marker);
      }else if(this.lastInfoWindow !== markerInfoWindow){
        this.lastInfoWindow.close();
        this.lastInfoWindow = markerInfoWindow;
        markerInfoWindow.open(this.mapInstance, marker);
      }else {
        this.lastInfoWindow = markerInfoWindow;
        markerInfoWindow.open(this.mapInstance, marker);
      }
    });
  }


  createPost(){
    // console.log('createPost');
    // if(this.title == "" || this.description ==""){
    //   alert("Title or description cannot be empty");
    //   return
    // }
    // let post ={
    //   _id: this.loggedInUser._id,
    //   title: this.title,
    //   description: this.description,
    // }
    // this.postService.createPost(post)
    // .subscribe((res)=>{
    //   this.posts.push(res.json());
    // });
    let place = this.inputPlace;
    if(!place){
      window.alert('Its an unrecognized place, please choose from autocomplete');
      return; }
    if(!place.geometry.viewport){
      window.alert('This place is not located on the map');
      return; }
    if(!this.title){
      window.alert('Please enter a title');
      return; }
    let post = {
      place: place,
      title: this.title,
      description: this.description,
      image_url: this.image_url,
      author: this.loggedInUser.username,
      // user_id suppose to be filled in from backend
      // using unique author name or from token/session
      user_id: this.loggedInUser._id,
    }
    this.postService.createPost(post)
    .subscribe(
      (data)=>{
      this.posts.push(data.json()),
      (err)=>{console.log(err);
        window.alert('Sorry, theres an error processing your post.');
      }
    });
    if(this.helperInfoWindow) this.helperInfoWindow.close();
    if(this.lastMarker) this.lastMarker.setAnimation(null);
    this.clearInputFields();
    console.log('added marker', this.posts);
  }

  updatePost(post,title,description){
    console.log(post._id,title,description);
    var inputPost: any = {
      title: title,
      description: description,
    }
    this.postService.updatePost(post._id,inputPost)
    .subscribe((oldPost)=>{
      console.log('old post', oldPost.json());

      let index = this.posts.findIndex(function(p){
        return p._id ==post._id;
      });
      this.posts[index].title = inputPost.title;
      this.posts[index].description = inputPost.description;
      console.log('new post is', this.posts[index])
      console.log('All posts are', this.posts)
      this.toggleEditable(this.posts[index]._id)
    });
  }

  deletePost(post_id){
    console.log(post_id)
    this.postService.deletePost(post_id)
    .subscribe((post)=>{
      console.log(post.json());
      let index = this.posts.indexOf(post.json());
      this.posts.splice(index,1);
    });
  }

  clearInputFields(){
    var input = <HTMLInputElement>(document.getElementById('geoSearch'));
    input.value = "";
    this.title = "";
    this.description = "";
    this.image_url = "";
    var infowindowContent = document.getElementById('infowindow-content');
    infowindowContent.children['place-icon'].src = "";
    infowindowContent.children['place-name'].textContent = "";
    infowindowContent.children['place-address'].textContent = "";
  }

  addCloseInfoWindowOnMapClickEvent(){
    this.mapInstance.addListener('click',()=>{
      if(this.lastInfoWindow){
        this.lastInfoWindow.close();
      }
      if(this.helperInfoWindow) this.helperInfoWindow.close();
      if(this.lastMarker) this.lastMarker.setAnimation(null);
    })
  }

  createNewMarker(){
    let marker = new google.maps.Marker({
      map: this.mapInstance,
      anchorPoint: new google.maps.Point(0, -29),
      draggable: false,
      animation: google.maps.Animation.DROP,
      position: null,
      icon: null,
    });
    return marker
  }

  formatAddress(address_components){
    return [
      (address_components[0] && address_components[0].short_name || ''),
      (address_components[1] && address_components[1].short_name || ''),
      (address_components[2] && address_components[2].short_name || '')
    ].join(' ');
  }

  toggleEditable(post_id){
    if(this.editable) this.editable = "";
    else this.editable = post_id;
  }

}
