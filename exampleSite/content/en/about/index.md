---
title: About Me
layout: about

resources:
- name: scarecrow
  src: scarecrow.jpg
---

{{< tags/cloud categories="test" caption="testing" >}}

this is more content

{{< timeline >}}
	{{< timeline/stop "present" >}}

	{{< timeline/plot "laksjdlaksjd" >}}
		testing
	{{</ timeline/plot >}}
{{</ timeline >}}

{{< columns >}}
	{{< resources/image name="scarecrow" title="testing" >}}
	{{< resources/image "scarecrow" "testing" >}}
{{</ columns >}}
