from PIL import Image
import io

def get_size(data_length, width=None):
	# source Malware images: visualization and automatic classification by L. Nataraj
	# url : http://dl.acm.org/citation.cfm?id=2016908

	if width is None: # with don't specified any with value

		size = data_length

		if (size < 10240):
			width = 32
		elif (10240 <= size <= 10240 * 3):
			width = 64
		elif (10240 * 3 <= size <= 10240 * 6):
			width = 128
		elif (10240 * 6 <= size <= 10240 * 10):
			width = 256
		elif (10240 * 10 <= size <= 10240 * 20):
			width = 384
		elif (10240 * 20 <= size <= 10240 * 50):
			width = 512
		elif (10240 * 50 <= size <= 10240 * 100):
			width = 768
		else:
			width = 1024

		height = int(size / width) + 1

	else:
		width  = int(math.sqrt(data_length)) + 1
		height = width

	return (width, height)



binary_values = []
with open("hlb4.bin", "rb") as fileobject:
	# read file byte by byte
	data = fileobject.read(1)

	while data != b'':
		binary_values.append(ord(data))
		data = fileobject.read(1)

	size  = get_size(len(binary_values))

	image = Image.new('L', size)
	image.putdata(binary_values)
	image.save('tempimage.jpg')