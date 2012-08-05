<div class="project-mid">
	<div class="image">
		<img src="<%= item.thumbnail %>"  width="225" height="150" alt="" />
		<div class="info">
		</div>
		<a href="/projects/<%= item.slug %>/" class="ajax">
		    <div class="title"><%= item.title %></div>
		    <div class="location"><%= item.location %></div>
		</a>
	</div>
	
	<div class="progressbar">
		<div class="donated-text" style="margin-left: 0px; opacity: 1; ">
			NOW <b>&euro;<span class="donated-amount"><%= item.money_donated %></span></b>					
		</div>
		<div class="asked-bar">
			<div class="donated-bar" style="width:0px; "></div>
		</div>
		<div class="asked-text">
			NEEDED <b>&euro;<span class="asked-amount"><%= item.money_asked %></span></b>
		</div>
	</div>
	<div class="support">
		SUPPORT THIS PROJECT
	</div>
</div>