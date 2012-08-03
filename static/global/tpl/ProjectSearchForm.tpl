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
	
	

	
	<h3>Text search</h3>
	
	<input name="text" type="text" />
	<select name="country__contains">
		<option value="">All countries</option>
		<% _.each(eval(items[0]['attributes'][1]), function(country) { %>
			<option value="<%= country.country %>">
				<%= country.country %> (<%= country.count %>)<br/>
			</option>
		<% }) %>
	</select>



	<h3>Phase</h3>
	<% _.each(eval(items[3]['attributes'][1]), function(phase) { %>
		<input type="checkbox" id="cb_phases_<%= phase.phase %>" name="phases[]" value="<%= phase.phase %>"
			<% if (phase.phase == 'plan') { %> checked <% } %>  
		 />
		<label for="cb_phases_<%= phase.phase %>">
			<b><%= phase.phase %></b> (<%= phase.count %>)
		</label><br/>
	<% }) %>

	
	<h3>Language</h3>
	<input type="checkbox" id="cb_language_nl" name="languages[]" value="nl"  />
	<label for="cb_language_nl">
		Dutch
	</label><br/>

	<input type="checkbox" id="cb_language_en" name="languages[]" value="en"  />
	<label for="cb_language_en">
		English
	</label><br />


	<h3>Themes</h3>

	<% _.each(eval(items[1]['attributes'][1]), function(category) { %>
		<input type="checkbox" id="cb_themes_<%= category.categories__slug %>" name="themes[]" value="<%= category.categories__slug %>"   />
		<label for="cb_themes_<%= category.categories__slug %>">
			<b><%= category.categories__name %></b> (<%= category.count %>)
		</label><br/>
	<% }) %>

	<h3>Tags</h3>

	<% _.each(eval(items[2]['attributes'][1]), function(tag) { %>
		<input type="checkbox" id="cb_themes_<%= tag.tags__name %>" name="tags[]" value="<%= tag.tags__name %>"   />
		<label for="cb_themes_<%= tag.tags__name %>">
			<b><%= tag.tags__name %></b> (<%= tag.count %>)
		</label><br/>
	<% }) %>

	<input type="submit" value="Search" />
</form>