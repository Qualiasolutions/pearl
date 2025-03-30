// Standard MediaPipe Face Mesh Tesselation connections
// https://github.com/google/mediapipe/blob/master/mediapipe/modules/face_geometry/data/canonical_face_model_uv_visualization.png
export const FACEMESH_TESSELATION: [number, number][] = [
  [234, 127], [127, 162], [162, 21], [21, 54], [54, 103], [103, 67],
  [67, 109], [109, 10], [10, 338], [338, 297], [297, 332], [332, 284],
  [284, 251], [251, 389], [389, 356], [356, 454], [454, 323], [323, 361],
  [361, 288], [288, 397], [397, 365], [365, 379], [379, 378], [378, 400],
  [400, 377], [377, 152], [152, 148], [148, 176], [176, 149], [149, 150],
  [150, 136], [136, 172], [172, 58], [58, 132], [132, 93], [93, 234],
  [127, 34], [34, 139], [139, 162], [21, 57], [57, 167], [167, 54],
  [103, 104], [104, 68], [68, 67], [109, 33], [33, 246], [246, 10],
  [338, 263], [263, 414], [414, 297], [332, 331], [331, 425], [425, 284],
  [251, 261], [261, 433], [433, 389], [356, 363], [363, 431], [431, 454],
  [323, 341], [341, 401], [401, 361], [288, 430], [430, 406], [406, 397],
  [365, 383], [383, 403], [403, 379], [378, 384], [384, 395], [395, 400],
  [377, 156], [156, 7], [7, 148], [176, 6], [6, 196], [196, 149],
  [150, 171], [171, 208], [208, 136], [172, 198], [198, 206], [206, 58],
  [132, 123], [123, 202], [202, 93], [127, 111], [111, 34], [34, 139],
  [139, 143], [143, 116], [116, 162], [21, 164], [164, 57], [57, 167],
  [167, 165], [165, 98], [98, 54], [103, 66], [66, 104], [104, 68],
  [68, 69], [69, 70], [70, 67], [109, 33], [33, 108], [108, 107],
  [107, 246], [246, 161], [161, 10], [338, 337], [337, 336], [336, 263],
  [263, 391], [391, 414], [414, 340], [340, 297], [332, 345], [345, 331],
  [331, 425], [425, 422], [422, 284], [251, 385], [385, 261], [261, 433],
  [433, 417], [417, 389], [356, 448], [448, 363], [363, 431], [431, 411],
  [411, 454], [323, 450], [450, 341], [341, 401], [401, 399], [399, 361],
  [288, 436], [436, 430], [430, 406], [406, 420], [420, 397], [365, 446],
  [446, 383], [383, 403], [403, 404], [404, 379], [378, 376], [376, 384],
  [384, 395], [395, 419], [419, 400], [377, 131], [131, 156], [156, 7],
  [7, 38], [38, 148], [176, 177], [177, 6], [6, 196], [196, 194], [194, 149],
  [150, 171], [171, 175], [175, 208], [208, 200], [200, 136], [172, 216],
  [216, 198], [198, 206], [206, 210], [210, 58], [132, 151], [151, 123],
  [123, 202], [202, 213], [213, 93], [93, 137], [137, 234], [234, 215],
  [215, 111], [111, 127], [111, 110], [110, 34], [139, 147], [147, 143],
  [143, 116], [116, 123], [123, 110], [116, 24], [24, 110], [162, 228],
  [228, 116], [21, 186], [186, 164], [164, 57], [167, 193], [193, 165],
  [165, 98], [98, 97], [97, 54], [54, 55], [55, 97], [98, 31],
  [31, 55], [103, 102], [102, 66], [66, 104], [68, 106], [106, 69],
  [69, 70], [70, 32], [32, 69], [70, 106], [67, 32], [32, 107],
  [107, 108], [108, 109], [109, 33], [108, 65], [65, 107], [33, 245],
  [245, 65], [246, 247], [247, 245], [247, 161], [161, 163], [163, 10],
  [10, 154], [154, 163], [161, 154], [337, 407], [407, 336], [336, 263],
  [391, 322], [322, 414], [340, 349], [349, 340], [349, 348], [348, 297],
  [332, 345], [345, 421], [421, 331], [425, 434], [434, 422], [422, 353],
  [353, 284], [251, 256], [256, 385], [261, 259], [259, 433], [417, 413],
  [413, 437], [437, 389], [356, 448], [448, 449], [449, 363], [431, 432],
  [432, 411], [411, 415], [415, 454], [323, 453], [453, 450], [450, 341],
  [401, 402], [402, 399], [399, 424], [424, 361], [288, 430], [430, 436],
  [436, 418], [418, 406], [420, 410], [410, 446], [446, 365], [383, 381],
  [381, 404], [403, 381], [404, 380], [380, 379], [378, 376], [376, 416],
  [416, 384], [395, 396], [396, 419], [400, 419], [400, 377], [131, 121],
  [121, 156], [7, 36], [36, 38], [148, 38], [148, 37], [37, 36],
  [176, 177], [177, 204], [204, 6], [196, 195], [195, 194], [149, 194],
  [149, 201], [201, 195], [171, 175], [175, 212], [212, 208], [200, 214],
  [214, 200], [214, 170], [170, 136], [172, 216], [216, 211], [211, 198],
  [206, 205], [205, 210], [58, 210], [58, 92], [92, 205], [132, 151],
  [151, 215], [215, 123], [202, 203], [203, 213], [93, 213], [93, 118],
  [118, 203], [137, 174], [174, 215], [111, 115], [115, 110], [139, 147],
  [147, 120], [120, 143], [116, 129], [129, 120], [123, 129], [110, 115],
  [110, 24], [24, 27], [27, 115], [162, 228], [228, 229], [229, 116],
  [21, 186], [186, 41], [41, 164], [57, 83], [83, 41], [167, 193],
  [193, 81], [81, 165], [98, 99], [99, 81], [54, 56], [56, 97], [55, 56],
  [31, 80], [80, 55], [103, 102], [102, 79], [79, 66], [104, 105], [105, 79],
  [68, 106], [69, 105], [70, 32], [107, 65], [33, 245], [246, 247],
  [161, 155], [155, 163], [10, 154], [336, 360], [360, 407], [263, 360],
  [391, 322], [414, 322], [414, 348], [340, 349], [297, 348], [345, 421],
  [331, 421], [331, 353], [425, 434], [422, 353], [284, 353], [256, 385],
  [261, 259], [433, 259], [433, 437], [417, 413], [389, 437], [448, 449],
  [363, 449], [363, 413], [431, 432], [411, 415], [454, 415], [454, 432],
  [453, 450], [341, 450], [341, 424], [401, 402], [399, 424], [361, 424],
  [436, 418], [406, 418], [406, 440], [420, 410], [397, 440], [365, 446],
  [403, 381], [379, 380], [384, 416], [395, 396], [400, 419], [121, 131],
  [121, 59], [59, 156], [7, 36], [38, 134], [134, 37], [177, 204],
  [6, 42], [42, 196], [194, 191], [191, 201], [175, 212], [208, 189],
  [189, 214], [170, 188], [188, 200], [216, 211], [198, 187], [187, 205],
  [210, 43], [43, 92], [151, 173], [173, 215], [202, 203], [93, 118],
  [137, 174], [127, 234], [115, 27], [147, 120], [116, 129], [110, 24],
  [228, 229], [162, 226], [226, 229], [186, 41], [164, 83], [193, 81],
  [165, 99], [98, 97], [54, 56], [55, 80], [102, 79], [104, 105],
  [67, 70], [108, 65], [247, 245], [155, 160], [160, 154], [337, 407],
  [336, 360], [322, 369], [369, 391], [349, 347], [347, 340], [421, 423],
  [423, 345], [434, 426], [426, 422], [433, 259], [413, 440], [440, 437],
  [449, 447], [447, 363], [432, 429], [429, 431], [415, 409], [409, 454],
  [450, 452], [452, 323], [402, 428], [428, 401], [418, 427], [427, 436],
  [410, 412], [412, 420], [380, 408], [408, 404], [416, 407], [407, 376],
  [396, 395], [419, 396], [59, 131], [134, 138], [138, 38], [42, 44],
  [44, 177], [191, 180], [180, 194], [189, 181], [181, 175], [188, 199],
  [199, 170], [187, 197], [197, 216], [43, 64], [64, 92], [173, 146],
  [146, 151], [118, 125], [125, 202], [174, 135], [135, 137], [27, 29],
  [29, 115], [120, 90], [90, 147], [129, 122], [122, 116], [229, 227],
  [227, 24], [226, 47], [47, 228], [83, 85], [85, 186], [81, 86], [86, 193],
  [99, 87], [87, 165], [97, 95], [95, 56], [80, 82], [82, 55], [79, 78],
  [78, 102], [105, 63], [63, 104], [32, 71], [71, 67], [65, 71], [160, 158],
  [158, 155], [154, 153], [153, 10], [407, 369], [369, 322], [347, 346],
  [346, 349], [423, 434], [426, 353], [440, 413], [447, 413], [429, 411],
  [409, 415], [452, 451], [451, 453], [428, 399], [427, 418], [412, 410],
  [408, 381], [407, 416], [138, 130], [130, 134], [44, 51], [51, 42],
  [180, 46], [46, 191], [181, 45], [45, 189], [199, 40], [40, 188],
  [197, 39], [39, 187], [64, 75], [75, 43], [146, 76], [76, 173],
  [125, 117], [117, 118], [135, 119], [119, 174], [29, 28], [28, 27],
  [90, 89], [89, 120], [122, 91], [91, 129], [227, 25], [25, 229],
  [47, 49], [49, 226], [85, 184], [184, 83], [86, 183], [183, 81],
  [87, 178], [178, 99], [95, 96], [96, 97], [82, 179], [179, 80],
  [78, 80], [78, 82], [63, 78], [71, 108], [158, 159], [159, 160],
  [153, 144], [144, 154], [369, 406], [346, 370], [370, 347], [423, 421],
  [426, 434], [447, 440], [429, 432], [409, 405], [405, 409], [405, 323],
  [451, 341], [428, 402], [427, 430], [412, 446], [408, 379], [130, 124],
  [124, 138], [51, 74], [74, 44], [46, 60], [60, 180], [45, 61], [61, 181],
  [40, 62], [62, 199], [39, 73], [73, 197], [75, 77], [77, 64], [76, 77],
  [117, 48], [48, 125], [119, 48], [28, 30], [30, 29], [89, 88], [88, 90],
  [91, 88], [25, 26], [26, 227], [49, 50], [50, 47], [184, 35], [35, 85],
  [183, 100], [100, 86], [178, 101], [101, 87], [96, 114], [114, 95],
  [179, 113], [113, 82], [63, 78], [159, 145], [145, 158], [144, 168],
  [168, 153], [406, 418], [370, 371], [371, 346], [421, 423], [405, 361],
  [124, 230], [230, 130], [74, 190], [190, 51], [60, 207], [207, 46],
  [61, 209], [209, 45], [62, 217], [217, 40], [73, 219], [219, 39],
  [77, 141], [141, 76], [117, 126], [126, 48], [30, 22], [22, 28],
  [88, 91], [26, 23], [23, 25], [50, 53], [53, 49], [35, 185], [185, 184],
  [100, 4], [4, 183], [101, 5], [5, 178], [114, 182], [182, 96],
  [113, 192], [192, 179], [145, 128], [128, 159], [168, 157], [157, 144],
  [371, 372], [372, 370], [361, 399], [230, 231], [231, 124], [190, 241],
  [241, 74], [207, 236], [236, 60], [209, 238], [238, 61], [217, 240],
  [240, 62], [219, 242], [242, 73], [141, 142], [142, 77], [126, 135],
  [135, 119], [119, 126], [22, 23], [23, 26], [26, 22], [53, 52], [52, 50],
  [185, 0], [0, 35], [4, 1], [1, 100], [5, 8], [8, 101], [182, 2], [2, 114],
  [192, 3], [3, 113], [128, 140], [140, 145], [157, 169], [169, 168],
  [372, 394], [394, 371], [231, 232], [232, 230], [241, 239], [239, 190],
  [236, 235], [235, 207], [238, 237], [237, 209], [240, 244], [244, 217],
  [242, 112], [112, 219], [142, 166], [166, 141], [135, 119], [52, 61],
  [52, 62], [52, 72], [72, 53], [0, 13], [13, 185], [1, 14], [14, 4],
  [8, 17], [17, 5], [2, 16], [16, 182], [3, 15], [15, 192], [140, 94],
  [94, 128], [169, 170], [170, 157], [394, 393], [393, 372], [232, 128],
  [128, 94], [94, 231], [239, 133], [133, 241], [235, 13], [13, 236],
  [237, 14], [14, 238], [244, 17], [17, 240], [112, 15], [15, 242],
  [166, 96], [96, 182], [182, 114], [114, 142], [72, 113], [113, 192],
  [192, 15], [15, 112], [112, 72], [13, 14], [14, 17], [17, 15], [15, 13],
  [94, 137], [137, 135], [135, 126], [126, 117], [117, 125], [125, 118],
  [118, 93], [93, 213], [213, 203], [203, 118], [170, 169], [393, 410],
  [410, 420], [420, 406], [406, 369], [369, 393], [94, 140], [133, 121],
  [121, 131], [131, 137], [137, 94], [13, 235], [14, 237], [17, 244],
  [15, 112], [96, 114], [114, 182], [182, 16], [16, 96], [72, 113],
  [113, 3], [3, 192], [192, 15], [15, 72], [16, 17], [17, 14], [14, 13],
  [13, 16], [118, 125], [125, 48], [48, 117], [117, 118]
]; 