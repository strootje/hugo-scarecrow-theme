---
title: Contact
menu: pages
---

## Send me a Message
{{< form "https://formspree.io/test123" >}}
	{{< form/row >}}
		{{< form/input/text label="Name:" placeholder="John Smith.." >}}
		{{< form/input/text label="Email:" type="email" placeholder="john@smith.me" >}}
	{{< /form/row >}}

	{{< form/row >}}
		{{< form/input/textarea label="Message:" placeholder="And now, human music.." >}}
	{{< /form/row >}}

	{{< form/row >}}
		{{< form/submit label="Send Message" >}}
	{{< /form/row >}}
{{< /form >}}
