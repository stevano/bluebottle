<h2>Search Projects</h2>

<form action="/projects/" class="ajax" method="get">

	<h3>Sorting</h3>

	<input type="radio" id="rb_order_just_alphabetically" name="order" value="alphabetically" checked />
	<label for="rb_order_just_alphabetically">
		<b>Alphabetically</b>
	</label><br/>
	
	<input type="radio" id="rb_order_newest" name="order" value="newest"  />
	<label for="rb_order_newest">
		<b>Newest</b>
	</label><br/>
	
	<input type="radio" id="rb_order_popularity" name="order" value="popularity" disabled />
	<label for="rb_order_popularity">
		<b>Popularity</b>
	</label><br/>

	<input type="radio" id="rb_order_almost_funded" name="order" value="almost_funded" disabled />
	<label for="rb_order_almost_funded">
		<b>Almost funded</b>
	</label><br/>
	
	<input type="radio" id="rb_order_deadline" name="order" value="deadline" disabled />
	<label for="rb_order_deadline">
		<b>Near deadline</b>
	</label><br/>
	
	<input type="radio" id="rb_order_just_supported" name="order" value="just_supported" disabled />
	<label for="rb_order_just_supported">
		<b>Just supported</b>
	</label><br/>
	
	<input type="submit" value="Search" />

	
	<h3>Language</h3>
	<input type="checkbox" id="cb_language_nl" name="languages[]" value="nl"  />
	<label for="cb_language_nl">
		Dutch
	</label><br/>

	<input type="checkbox" id="cb_language_en" name="languages[]" value="en"  />
	<label for="cb_language_en">
		English
	</label><br />


	<%= list %>


</form>