/* MoveNet Skeleton - Steve's Makerspace (most of this code is from TensorFlow)

MoveNet is developed by TensorFlow:
https://www.tensorflow.org/hub/tutorials/movenet

*/

function preload() { 
  carImg = loadImage("upload_7dd6374659c38a191c0e3eb86f1d75c5.gif");
}

let video, bodypose, pose, keypoint, detector;
let poses = [];
let leftElbowX, leftElbowY, rightElbowX, rightElbowY; // Positions of elbows
let leftImgX, rightImgX; // X coordinates for image positions
let imgSpeed = 2; // Speed of image movement

async function init() {
  const detectorConfig = {
    modelType: poseDetection.movenet.modelType.MULTIPOSE_LIGHTNING,
  };
  detector = await poseDetection.createDetector(
    poseDetection.SupportedModels.MoveNet,
    detectorConfig
  );
}

async function videoReady() {
  console.log("video ready");
  await getPoses();
}

async function getPoses() {
  if (detector) {
    poses = await detector.estimatePoses(video.elt, {
      maxPoses: 2,
      //flipHorizontal: true,
    });
  }
  requestAnimationFrame(getPoses);
}

async function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO, videoReady);
  video.size(width, height);
  video.hide();
  await init();

  stroke(255);
  strokeWeight(5);

  leftImgX = 0; // Start the left image off-canvas to the left
  rightImgX = 0; // Start the right image off-canvas to the left
}

function draw() {
  image(video, 0, 0);
  drawSkeleton();
  // flip horizontal
  let cam = get();
  translate(cam.width, 0);
  scale(-1, 1);
  image(cam, 0, 0);
  
  // Move images from left to right
  leftImgX += imgSpeed;
  rightImgX += imgSpeed;
  if (leftImgX > width) {
    leftImgX = -carImg.width; // Reset the left image position once it moves off-canvas
  }
  if (rightImgX > width) {
    rightImgX = -carImg.width; // Reset the right image position once it moves off-canvas
  }
  
  // Draw images at the new positions
  if (leftElbowX && leftElbowY) {
    image(carImg, leftImgX, leftElbowY - carImg.height / 2); // Draw the image at the left elbow position
  }
  if (rightElbowX && rightElbowY) {
    image(carImg, rightImgX, rightElbowY - carImg.height / 2); // Draw the image at the right elbow position
  }
}

function drawSkeleton() {
  // Draw all the tracked landmark points
  for (let i = 0; i < poses.length; i++) {
    pose = poses[i];
    // shoulder to wrist

    partA = pose.keypoints[0];

    if(partA.score > 0.1){
      push()
        textSize(40)
        scale(-1,1)
        text("412730763,陳玟伶",partA.x-width,partA.y-150)
      pop()
    }
    
    for (let j = 5; j < 9; j++) {
      if (pose.keypoints[j].score > 0.1 && pose.keypoints[j + 2].score > 0.1) {
        partA = pose.keypoints[j];
        partB = pose.keypoints[j + 2];
        line(partA.x, partA.y, partB.x, partB.y);
      }
    }
    // shoulder to shoulder
    partA = pose.keypoints[5];
    partB = pose.keypoints[6];
    if (partA.score > 0.1 && partB.score > 0.1) {
        //line(partA.x, partA.y, partB.x, partB.y);
    push()
      image(carImg,partA.x-75, partA.y-75,150,150)  //左邊肩膀
      image(carImg,partB.x-75, partB.y-75,150,150)  //右邊肩膀
    pop()
    }
    // hip to hip
    partA = pose.keypoints[11];
    partB = pose.keypoints[12];
    if (partA.score > 0.1 && partB.score > 0.1) {
      line(partA.x, partA.y, partB.x, partB.y);
    }
    // shoulders to hips
    partA = pose.keypoints[5];
    partB = pose.keypoints[11];
    if (partA.score > 0.1 && partB.score > 0.1) {
      line(partA.x, partA.y, partB.x, partB.y);
    }
    partA = pose.keypoints[6];
    partB = pose.keypoints[12];
    if (partA.score > 0.1 && partB.score > 0.1) {
      line(partA.x, partA.y, partB.x, partB.y);
    }
    // hip to foot
    for (let j = 11; j < 15; j++) {
      if (pose.keypoints[j].score > 0.1 && pose.keypoints[j + 2].score > 0.1) {
        partA = pose.keypoints[j];
        partB = pose.keypoints[j + 2];
        line(partA.x, partA.y, partB.x, partB.y);
      }
    }
    
    // Capture left and right elbow positions
    if (pose.keypoints[7].score > 0.1) {
      leftElbowX = pose.keypoints[7].x;
      leftElbowY = pose.keypoints[7].y;
    }
    if (pose.keypoints[8].score > 0.1) {
      rightElbowX = pose.keypoints[8].x;
      rightElbowY = pose.keypoints[8].y;
    }
  }
}

/* Points (view on left of screen = left part - when mirrored)
  0 nose
  1 left eye
  2 right eye
  3 left ear
  4 right ear
  5 left shoulder
  6 right shoulder
  7 left elbow
  8 right elbow
  9 left wrist
  10 right wrist
  11 left hip
  12 right hip
  13 left kneee
  14 right knee
  15 left foot
  16 right foot
*/
