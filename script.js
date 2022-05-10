
const loadImage = (IMAGE_SRC, architecture, outputStride, quantBytes, segmentationThreshold, scoreTreshold) => {
  const img = new Image()
  img.src = IMAGE_SRC

  const canvas = document.querySelector('canvas')
  const ctx = canvas.getContext('2d')

  img.addEventListener('load', () => {
    canvas.width = img.width
    canvas.height = img.height
    ctx.drawImage(img, 0, 0)
    backgroundRemoval(architecture, outputStride, quantBytes, segmentationThreshold, scoreTreshold)
  })
}

const backgroundRemoval = async (architecture, outputStride, quantBytes, segmentationThreshold, scoreTreshold) => {
  const canvas = document.querySelector('canvas')

  const net = await bodyPix.load({
    architecture: architecture, // 'ResNet50',
    outputStride: outputStride, //32,
    quantBytes: quantBytes, // 4
  })
  const segmentation = await net.segmentPerson(canvas, {
    internalResolution: 'medium',
    segmentationThreshold: segmentationThreshold, // 0.7,
    scoreTreshold: scoreTreshold, // 0.7
  })

  const ctx = canvas.getContext('2d')
  const { data: imgData } = ctx.getImageData(0, 0, canvas.width, canvas.height)

  const newImg = ctx.createImageData(canvas.width, canvas.height)
  const newImgData = newImg.data

  segmentation.data.forEach((segment, i) => {
    if (segment == 1) {
      newImgData[i * 4] = imgData[i * 4]
      newImgData[i * 4 + 1] = imgData[i * 4 + 1]
      newImgData[i * 4 + 2] = imgData[i * 4 + 2]
      newImgData[i * 4 + 3] = imgData[i * 4 + 3]
    }
  })

  ctx.putImageData(newImg, 0, 0)
}

loadImage()
