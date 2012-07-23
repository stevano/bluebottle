<div class="image">
	<img src="http://placehold.it/225x120" alt="" />
</div>
<div class="title">
	<a href="/projects/<%= slug %>/" class="ajax">
	    <h3><%= title %></h3>
	    <%= description %>
	</a>
</div>

<div class="progressbar">
	<div class="amount-donated left" style="margin-left: 25%; opacity: 1; ">
		Now: <b>&euro;<%= money_donated %></b>					
	</div>
	<div class="asked">
		<div class="donated" style="width: 51px; "></div>
	</div>
	<div class="amount-asked">
		Needed: <b>&euro;<%= money_asked %></b>
	</div>
</div>
<div class="support">
	SUPPORT THIS PROJECT
</div>
